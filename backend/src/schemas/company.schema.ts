import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().transform((val) => val.replace(/\D/g, '')).pipe(z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 digitos')),
  contact: z.string().min(2, 'Contato deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  phone: z.string().min(1, 'Telefone e obrigatorio'),
  logoUrl: z.string().url('URL do logo invalida').optional().nullable(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
