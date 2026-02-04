import { Response } from 'express';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { z } from 'zod';

const createContentSchema = z.object({
  section: z.string().min(1, 'Secao e obrigatoria'),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  imageUrl: z.string().url('URL da imagem invalida').optional().nullable(),
  videoUrl: z.string().url('URL do video invalida').optional().nullable(),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
  displayOrder: z.number().optional(),
});

const updateContentSchema = createContentSchema.partial();

const newsletterSchema = z.object({
  email: z.string().email('Email invalido'),
  fullName: z.string().optional().nullable(),
  source: z.string().optional(),
});

export const listContent = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const content = await prisma.landingContent.findMany({
    where: { active: true },
    orderBy: [{ section: 'asc' }, { displayOrder: 'asc' }],
  });

  res.json({
    success: true,
    data: content,
  });
});

export const listAllContent = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const content = await prisma.landingContent.findMany({
    orderBy: [{ section: 'asc' }, { displayOrder: 'asc' }],
  });

  res.json({
    success: true,
    data: content,
  });
});

export const getContentById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const content = await prisma.landingContent.findUnique({ where: { id } });

  if (!content) {
    throw new AppError('Conteudo nao encontrado', 404, 'CONTENT_NOT_FOUND');
  }

  res.json({
    success: true,
    data: content,
  });
});

export const createContent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createContentSchema.parse(req.body);

  const content = await prisma.landingContent.create({
    data: {
      ...input,
      createdBy: req.user!.sub,
      updatedBy: req.user!.sub,
    },
  });

  res.status(201).json({
    success: true,
    data: content,
  });
});

export const updateContent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateContentSchema.parse(req.body);

  const existing = await prisma.landingContent.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Conteudo nao encontrado', 404, 'CONTENT_NOT_FOUND');
  }

  const content = await prisma.landingContent.update({
    where: { id },
    data: {
      ...input,
      updatedBy: req.user!.sub,
    },
  });

  res.json({
    success: true,
    data: content,
  });
});

export const deleteContent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.landingContent.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Conteudo nao encontrado', 404, 'CONTENT_NOT_FOUND');
  }

  await prisma.landingContent.update({
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
    message: 'Conteudo removido com sucesso',
  });
});

// Newsletter
export const subscribeNewsletter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = newsletterSchema.parse(req.body);

  // Verificar se ja existe
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    if (existing.active) {
      throw new AppError('Email ja cadastrado na newsletter', 400, 'ALREADY_SUBSCRIBED');
    }

    // Reativar inscricao
    await prisma.newsletterSubscriber.update({
      where: { email: input.email },
      data: {
        active: true,
        unsubscribedAt: null,
        fullName: input.fullName,
      },
    });

    res.json({
      success: true,
      message: 'Inscricao reativada com sucesso!',
    });
    return;
  }

  await prisma.newsletterSubscriber.create({
    data: {
      email: input.email,
      fullName: input.fullName,
      source: input.source || 'landing_page',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Inscrito com sucesso na newsletter!',
  });
});

export const unsubscribeNewsletter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (!subscriber) {
    throw new AppError('Email nao encontrado', 404, 'NOT_FOUND');
  }

  await prisma.newsletterSubscriber.update({
    where: { email },
    data: {
      active: false,
      unsubscribedAt: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'Descadastrado da newsletter com sucesso',
  });
});

export const listSubscribers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { active: true },
    orderBy: { subscribedAt: 'desc' },
  });

  res.json({
    success: true,
    data: subscribers,
  });
});
