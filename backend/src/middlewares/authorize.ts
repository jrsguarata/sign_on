import { Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from './errorHandler.js';

// Middleware para verificar roles permitidas
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Nao autenticado',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Sem permissao para acessar este recurso',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}

// Middleware para validar acesso a recursos da mesma companhia
export function validateCompanyScope(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Nao autenticado',
      code: 'NOT_AUTHENTICATED',
    });
    return;
  }

  // SUPER_ADMIN tem acesso a tudo
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Para outros roles, verificar se esta acessando sua propria companhia
  const resourceCompanyId = req.params.companyId || req.body.companyId;

  if (resourceCompanyId && resourceCompanyId !== req.user.companyId) {
    res.status(403).json({
      success: false,
      error: 'Acesso negado a recursos de outra companhia',
      code: 'COMPANY_SCOPE_VIOLATION',
    });
    return;
  }

  next();
}

// Middleware para verificar se usuario pode gerenciar outro usuario
export function canManageUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Nao autenticado',
      code: 'NOT_AUTHENTICATED',
    });
    return;
  }

  const targetRole = req.body.role as UserRole;

  // SUPER_ADMIN pode gerenciar qualquer usuario
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // COMPANY_ADMIN so pode gerenciar COMPANY_OPERATOR da sua companhia
  if (req.user.role === 'COMPANY_ADMIN') {
    if (targetRole && targetRole !== 'COMPANY_OPERATOR') {
      throw new AppError(
        'Voce so pode gerenciar operadores',
        403,
        'CANNOT_MANAGE_ROLE'
      );
    }
    return next();
  }

  // COMPANY_OPERATOR nao pode gerenciar usuarios
  res.status(403).json({
    success: false,
    error: 'Sem permissao para gerenciar usuarios',
    code: 'FORBIDDEN',
  });
}
