import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { prisma } from '../config/database.js';

// Middleware para adicionar campos de auditoria automaticamente
export function auditMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.user && req.body) {
    const now = new Date();

    if (req.method === 'POST') {
      req.body.createdBy = req.user.sub;
      req.body.updatedBy = req.user.sub;
      req.body.createdAt = now;
      req.body.updatedAt = now;
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      req.body.updatedBy = req.user.sub;
      req.body.updatedAt = now;
    }
  }

  next();
}

// Log de acesso para endpoints importantes
export async function logAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const startTime = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - startTime;

    if (req.user) {
      try {
        await prisma.accessLog.create({
          data: {
            userId: req.user.sub,
            action: `${req.method} ${req.path}`,
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
        });
      } catch (error) {
        console.error('Failed to log access:', error);
      }
    }

    // Log para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
      );
    }
  });

  next();
}
