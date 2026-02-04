import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiuscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minuscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um numero'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.nativeEnum(UserRole),
  companyId: z.string().uuid('ID da companhia invalido').optional().nullable(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url('URL do avatar invalida').optional().nullable(),
}).refine(
  (data) => {
    // SUPER_ADMIN nao pode ter companyId
    if (data.role === 'SUPER_ADMIN' && data.companyId) {
      return false;
    }
    // COMPANY_ADMIN e COMPANY_OPERATOR devem ter companyId
    if ((data.role === 'COMPANY_ADMIN' || data.role === 'COMPANY_OPERATOR') && !data.companyId) {
      return false;
    }
    return true;
  },
  {
    message: 'SUPER_ADMIN nao deve ter companhia. COMPANY_ADMIN e COMPANY_OPERATOR devem ter companhia.',
  }
);

export const updateUserSchema = z.object({
  email: z.string().email('Email invalido').optional(),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().url('URL do avatar invalida').optional().nullable(),
  active: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
