import { Response } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../schemas/auth.schema.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);

  res.json({
    success: true,
    data: result,
  });
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);

  await authService.logout(refreshToken, req.user?.sub);

  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
});

export const refresh = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = refreshTokenSchema.parse(req.body);
  const result = await authService.refresh(refreshToken);

  res.json({
    success: true,
    data: result,
  });
});

export const me = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Nao autenticado',
    });
    return;
  }

  const user = await authService.getCurrentUser(req.user.sub);

  res.json({
    success: true,
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Nao autenticado',
    });
    return;
  }

  const input = updateProfileSchema.parse(req.body);
  const user = await authService.updateProfile(req.user.sub, input);

  res.json({
    success: true,
    data: user,
  });
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Nao autenticado',
    });
    return;
  }

  const input = changePasswordSchema.parse(req.body);
  const result = await authService.changePassword(req.user.sub, input);

  res.json({
    success: true,
    message: result.message,
  });
});

export const validateToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.body;
  const apiKey = req.headers['x-api-key'] as string;

  if (!token || !apiKey) {
    res.status(400).json({
      success: false,
      error: 'Token e API Key sao obrigatorios',
    });
    return;
  }

  const result = await authService.validateToken(token, apiKey);

  res.json({
    success: true,
    data: result,
  });
});
