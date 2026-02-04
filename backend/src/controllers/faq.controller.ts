import { Response } from 'express';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { z } from 'zod';

const createFaqSchema = z.object({
  question: z.string().min(5, 'Pergunta deve ter pelo menos 5 caracteres'),
  answer: z.string().min(10, 'Resposta deve ter pelo menos 10 caracteres'),
  category: z.string().optional().nullable(),
  displayOrder: z.number().optional(),
});

const updateFaqSchema = createFaqSchema.partial();

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { category } = req.query;

  const where: Record<string, unknown> = { active: true };
  if (category) {
    where.category = category;
  }

  const faqs = await prisma.faq.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  res.json({
    success: true,
    data: faqs,
  });
});

export const listAll = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  res.json({
    success: true,
    data: faqs,
  });
});

export const getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const faq = await prisma.faq.findUnique({ where: { id } });

  if (!faq) {
    throw new AppError('FAQ nao encontrado', 404, 'FAQ_NOT_FOUND');
  }

  res.json({
    success: true,
    data: faq,
  });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createFaqSchema.parse(req.body);

  const faq = await prisma.faq.create({
    data: {
      ...input,
      createdBy: req.user!.sub,
      updatedBy: req.user!.sub,
    },
  });

  res.status(201).json({
    success: true,
    data: faq,
  });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateFaqSchema.parse(req.body);

  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('FAQ nao encontrado', 404, 'FAQ_NOT_FOUND');
  }

  const faq = await prisma.faq.update({
    where: { id },
    data: {
      ...input,
      updatedBy: req.user!.sub,
    },
  });

  res.json({
    success: true,
    data: faq,
  });
});

export const deactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.faq.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('FAQ nao encontrado', 404, 'FAQ_NOT_FOUND');
  }

  const faq = await prisma.faq.update({
    where: { id },
    data: {
      active: false,
      deactivatedAt: new Date(),
      deactivatedBy: req.user!.sub,
      updatedBy: req.user!.sub,
    },
  });

  res.json({
    success: true,
    data: faq,
    message: 'FAQ desativado com sucesso',
  });
});

// Incrementar visualizacoes (publico)
export const incrementViews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await prisma.faq.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  res.json({ success: true });
});

// Marcar como util (publico)
export const markHelpful = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  await prisma.faq.update({
    where: { id },
    data: { helpfulCount: { increment: 1 } },
  });

  res.json({ success: true });
});
