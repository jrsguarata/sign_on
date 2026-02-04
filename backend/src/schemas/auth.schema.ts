import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Senha e obrigatoria'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token e obrigatorio'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual e obrigatoria'),
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Nova senha deve conter pelo menos uma letra maiuscula')
    .regex(/[a-z]/, 'Nova senha deve conter pelo menos uma letra minuscula')
    .regex(/[0-9]/, 'Nova senha deve conter pelo menos um numero')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Nova senha deve conter pelo menos um caractere especial'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('URL do avatar invalida').optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
