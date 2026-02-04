import { Response } from 'express';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler, AppError } from '../middlewares/errorHandler.js';
import { generateSlug } from '../utils/helpers.js';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  fullDescription: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
  priceMonthly: z.number().optional().nullable(),
  priceYearly: z.number().optional().nullable(),
  imageUrl: z.string().url('URL da imagem invalida').optional().nullable(),
  iconUrl: z.string().url('URL do icone invalida').optional().nullable(),
  displayOrder: z.number().optional(),
  isFeatured: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

export const list = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });

  res.json({
    success: true,
    data: products,
  });
});

export const listAll = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const products = await prisma.product.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  res.json({
    success: true,
    data: products,
  });
});

export const getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new AppError('Produto nao encontrado', 404, 'PRODUCT_NOT_FOUND');
  }

  res.json({
    success: true,
    data: product,
  });
});

export const getBySlug = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { slug } = req.params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
  });

  if (!product) {
    throw new AppError('Produto nao encontrado', 404, 'PRODUCT_NOT_FOUND');
  }

  res.json({
    success: true,
    data: product,
  });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createProductSchema.parse(req.body);
  const slug = input.slug || generateSlug(input.name);

  // Verificar slug unico
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError('Slug ja existe', 400, 'SLUG_ALREADY_EXISTS');
  }

  const product = await prisma.product.create({
    data: {
      ...input,
      slug,
      createdBy: req.user!.sub,
      updatedBy: req.user!.sub,
    },
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateProductSchema.parse(req.body);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Produto nao encontrado', 404, 'PRODUCT_NOT_FOUND');
  }

  // Verificar slug unico se alterado
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await prisma.product.findUnique({ where: { slug: input.slug } });
    if (slugExists) {
      throw new AppError('Slug ja existe', 400, 'SLUG_ALREADY_EXISTS');
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...input,
      updatedBy: req.user!.sub,
    },
  });

  res.json({
    success: true,
    data: product,
  });
});

export const deactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Produto nao encontrado', 404, 'PRODUCT_NOT_FOUND');
  }

  const product = await prisma.product.update({
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
    data: product,
    message: 'Produto desativado com sucesso',
  });
});
