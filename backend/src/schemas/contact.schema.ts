import { z } from 'zod';
import { ContactStatus, ContactPriority, InteractionType } from '@prisma/client';

export const createContactSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  phone: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  interestedIn: z.enum(['demo', 'trial', 'pricing', 'partnership', 'other']).optional(),
  products: z.array(z.string()).optional(),
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export const updateContactStatusSchema = z.object({
  status: z.nativeEnum(ContactStatus),
});

export const updateContactPrioritySchema = z.object({
  priority: z.nativeEnum(ContactPriority),
});

export const assignContactSchema = z.object({
  userId: z.string().uuid('ID do usuario invalido').nullable(),
});

export const updateContactNotesSchema = z.object({
  notes: z.string().optional().nullable(),
});

export const createInteractionSchema = z.object({
  interactionType: z.nativeEnum(InteractionType),
  subject: z.string().optional().nullable(),
  description: z.string().min(1, 'Descricao e obrigatoria'),
  nextFollowupAt: z.string().datetime().optional().nullable(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>;
export type UpdateContactPriorityInput = z.infer<typeof updateContactPrioritySchema>;
export type AssignContactInput = z.infer<typeof assignContactSchema>;
export type UpdateContactNotesInput = z.infer<typeof updateContactNotesSchema>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
