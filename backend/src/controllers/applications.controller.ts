import { Response } from 'express';
import { applicationsService } from '../services/applications.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { z } from 'zod';

const createApplicationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  url: z.string().url('URL invalida'),
  iconUrl: z.string().url('URL do icone invalida').optional().nullable(),
});

const updateApplicationSchema = createApplicationSchema.partial();

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const applications = await applicationsService.list();

  res.json({
    success: true,
    data: applications,
  });
});

export const listAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const applications = await applicationsService.listAll();

  res.json({
    success: true,
    data: applications,
  });
});

export const getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const application = await applicationsService.getById(id);

  res.json({
    success: true,
    data: application,
  });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createApplicationSchema.parse(req.body);
  const application = await applicationsService.create(input, req.user!.sub);

  res.status(201).json({
    success: true,
    data: application,
  });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateApplicationSchema.parse(req.body);
  const application = await applicationsService.update(id, input, req.user!.sub);

  res.json({
    success: true,
    data: application,
  });
});

export const deactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const application = await applicationsService.deactivate(id, req.user!.sub);

  res.json({
    success: true,
    data: application,
    message: 'Aplicacao desativada com sucesso',
  });
});

export const reactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const application = await applicationsService.reactivate(id, req.user!.sub);

  res.json({
    success: true,
    data: application,
    message: 'Aplicacao reativada com sucesso',
  });
});

export const regenerateApiKey = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = await applicationsService.regenerateApiKey(id, req.user!.sub);

  res.json({
    success: true,
    data: result,
    message: 'API Key regenerada com sucesso',
  });
});

// Aplicacoes disponiveis para o usuario logado
export const getAvailable = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const applications = await applicationsService.getAvailableForUser(
    req.user!.sub,
    req.user!.companyId,
    req.user!.role
  );

  res.json({
    success: true,
    data: applications,
  });
});

// Gerar URL de acesso
export const getAccessUrl = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { applicationId } = req.body;

  const result = await applicationsService.generateAccessUrl(
    applicationId,
    req.user!.sub,
    req.user!.companyId,
    req.user!.role
  );

  res.json({
    success: true,
    data: result,
  });
});
