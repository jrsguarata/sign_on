import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { jwtConfig, parseExpiration } from '../config/jwt.js';
import { prisma } from '../config/database.js';
import { JwtPayload } from '../types/index.js';

interface TokenUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  companyId: string | null;
  companyName: string | null;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class TokenService {
  // Gerar par de tokens (access + refresh)
  async generateTokenPair(user: TokenUser): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  // Gerar access token (curta duracao)
  generateAccessToken(user: TokenUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.companyName,
      type: 'access',
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessExpiration,
    });
  }

  // Gerar refresh token (longa duracao) e salvar no banco
  async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = crypto.randomUUID();
    const expirationMs = parseExpiration(jwtConfig.refreshExpiration);
    const expiresAt = new Date(Date.now() + expirationMs);

    const payload = {
      sub: userId,
      jti: tokenId,
      type: 'refresh',
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.refreshExpiration,
    });

    // Hash do token para armazenar no banco
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Salvar no banco
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return token;
  }

  // Validar refresh token
  async validateRefreshToken(token: string): Promise<{ userId: string; tokenId: string } | null> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as {
        sub: string;
        jti: string;
        type: string;
      };

      if (decoded.type !== 'refresh') {
        return null;
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Verificar se o token existe e nao foi revogado
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          tokenHash,
          userId: decoded.sub,
          revoked: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedToken) {
        return null;
      }

      return { userId: decoded.sub, tokenId: storedToken.id };
    } catch {
      return null;
    }
  }

  // Revogar refresh token
  async revokeRefreshToken(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  // Revogar todos os refresh tokens de um usuario
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  // Limpar tokens expirados (pode ser executado periodicamente)
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revoked: true },
        ],
      },
    });

    return result.count;
  }
}

export const tokenService = new TokenService();
