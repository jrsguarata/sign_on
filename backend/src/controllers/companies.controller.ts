import { Response } from 'express';
import { companiesService } from '../services/companies.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { createCompanySchema, updateCompanySchema } from '../schemas/company.schema.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { active, search, page, limit } = req.query;

  const filters = {
    active: active === 'true' ? true : active === 'false' ? false : undefined,
    search: search as string | undefined,
  };

  const result = await companiesService.list(
    filters,
    Number(page) || 1,
    Number(limit) || 20
  );

  res.json({
    success: true,
    data: result,
  });
});

export const getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const company = await companiesService.getById(id);

  res.json({
    success: true,
    data: company,
  });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createCompanySchema.parse(req.body);
  const company = await companiesService.create(input, req.user!.sub);

  res.status(201).json({
    success: true,
    data: company,
  });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateCompanySchema.parse(req.body);
  const company = await companiesService.update(id, input, req.user!.sub);

  res.json({
    success: true,
    data: company,
  });
});

export const deactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const company = await companiesService.deactivate(id, req.user!.sub);

  res.json({
    success: true,
    data: company,
    message: 'Companhia desativada com sucesso',
  });
});

export const reactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const company = await companiesService.reactivate(id, req.user!.sub);

  res.json({
    success: true,
    data: company,
    message: 'Companhia reativada com sucesso',
  });
});

export const linkApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { applicationId, expiresAt } = req.body;

  const link = await companiesService.linkApplication(
    id,
    applicationId,
    req.user!.sub,
    expiresAt ? new Date(expiresAt) : undefined
  );

  res.status(201).json({
    success: true,
    data: link,
    message: 'Aplicacao vinculada com sucesso',
  });
});

export const unlinkApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, appId } = req.params;

  await companiesService.unlinkApplication(companyId, appId, req.user!.sub);

  res.json({
    success: true,
    message: 'Aplicacao desvinculada com sucesso',
  });
});

export const getApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const applications = await companiesService.getApplications(id);

  res.json({
    success: true,
    data: applications,
  });
});
