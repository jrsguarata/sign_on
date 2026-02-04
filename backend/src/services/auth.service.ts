import { prisma } from '../config/database.js';
import { tokenService } from './token.service.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { AppError } from '../middlewares/errorHandler.js';
import { LoginInput, ChangePasswordInput, UpdateProfileInput } from '../schemas/auth.schema.js';

export class AuthService {
  // Login
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { company: true },
    });

    if (!user) {
      throw new AppError('Credenciais invalidas', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.active) {
      throw new AppError('Usuario inativo', 401, 'USER_INACTIVE');
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Credenciais invalidas', 401, 'INVALID_CREDENTIALS');
    }

    // Atualizar ultimo login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Gerar tokens
    const tokens = await tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company?.name || null,
    });

    // Log de acesso
    await prisma.accessLog.create({
      data: {
        userId: user.id,
        action: 'login',
        ipAddress: null,
        userAgent: null,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name || null,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  // Logout
  async logout(refreshToken: string, userId?: string) {
    await tokenService.revokeRefreshToken(refreshToken);

    // Log de acesso
    if (userId) {
      await prisma.accessLog.create({
        data: {
          userId,
          action: 'logout',
        },
      });
    }
  }

  // Refresh token
  async refresh(refreshToken: string) {
    const validation = await tokenService.validateRefreshToken(refreshToken);

    if (!validation) {
      throw new AppError('Refresh token invalido ou expirado', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: validation.userId },
      include: { company: true },
    });

    if (!user || !user.active) {
      throw new AppError('Usuario nao encontrado ou inativo', 401, 'USER_NOT_FOUND');
    }

    // Gerar novo access token
    const accessToken = tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company?.name || null,
    });

    // Log de acesso
    await prisma.accessLog.create({
      data: {
        userId: user.id,
        action: 'token_refresh',
      },
    });

    return { accessToken };
  }

  // Obter usuario atual
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      companyId: user.companyId,
      companyName: user.company?.name || null,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }

  // Atualizar perfil
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
        updatedBy: userId,
      },
      include: { company: true },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      companyId: user.companyId,
      companyName: user.company?.name || null,
    };
  }

  // Alterar senha
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    const isValidPassword = await verifyPassword(input.currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedBy: userId,
      },
    });

    // Revogar todos os tokens para forcar novo login
    await tokenService.revokeAllUserTokens(userId);

    return { message: 'Senha alterada com sucesso' };
  }

  // Validar token (para aplicacoes externas)
  async validateToken(token: string, apiKey: string) {
    // Verificar API Key da aplicacao
    const application = await prisma.application.findUnique({
      where: { apiKey },
    });

    if (!application || !application.active) {
      throw new AppError('API Key invalida', 401, 'INVALID_API_KEY');
    }

    try {
      const decoded = tokenService.generateAccessToken as unknown; // Apenas para tipagem
      // Na verdade, vamos usar jwt.verify diretamente
      const jwt = await import('jsonwebtoken');
      const { jwtConfig } = await import('../config/jwt.js');

      const payload = jwt.default.verify(token, jwtConfig.secret) as {
        sub: string;
        email: string;
        name: string;
        role: string;
        companyId: string | null;
        type: string;
      };

      if (payload.type !== 'access') {
        throw new AppError('Token invalido', 401, 'INVALID_TOKEN');
      }

      // Verificar se o usuario tem acesso a esta aplicacao
      if (payload.companyId) {
        const hasAccess = await prisma.companyApplication.findFirst({
          where: {
            companyId: payload.companyId,
            applicationId: application.id,
            active: true,
          },
        });

        if (!hasAccess) {
          throw new AppError('Usuario nao tem acesso a esta aplicacao', 403, 'NO_ACCESS');
        }
      }

      return {
        valid: true,
        user: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          companyId: payload.companyId,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Token invalido', 401, 'INVALID_TOKEN');
    }
  }
}

export const authService = new AuthService();
