import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest, JwtPayload } from '../types/index.js';
import { AppError } from './errorHandler.js';

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token nao fornecido', 401, 'NO_TOKEN');
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;

    // Verificar se e um access token
    if (decoded.type !== 'access') {
      throw new AppError('Token invalido', 401, 'INVALID_TOKEN_TYPE');
    }

    // Verificar se o usuario ainda existe e esta ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: { company: true },
    });

    if (!user || !user.active) {
      throw new AppError('Usuario nao encontrado ou inativo', 401, 'USER_NOT_FOUND');
    }

    // Adicionar dados do usuario ao request
    req.user = {
      sub: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      companyId: user.companyId,
      companyName: user.company?.name || null,
      type: 'access',
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token invalido',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    next(error);
  }
}

// Middleware opcional - nao falha se nao houver token
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;

    if (decoded.type === 'access') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        include: { company: true },
      });

      if (user && user.active) {
        req.user = {
          sub: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name || null,
          type: 'access',
        };
      }
    }

    next();
  } catch {
    // Ignora erros de token e continua sem autenticacao
    next();
  }
}
