import { Response } from 'express';
import { usersService } from '../services/users.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { UserRole } from '@prisma/client';

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { role, companyId, active, search, page, limit } = req.query;

  const filters = {
    role: role as UserRole | undefined,
    companyId: companyId as string | undefined,
    active: active === 'true' ? true : active === 'false' ? false : undefined,
    search: search as string | undefined,
  };

  const result = await usersService.list(
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
  const user = await usersService.getById(id);

  res.json({
    success: true,
    data: user,
  });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createUserSchema.parse(req.body);
  const user = await usersService.create(input, req.user!.sub);

  res.status(201).json({
    success: true,
    data: user,
  });
});

export const update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateUserSchema.parse(req.body);
  const user = await usersService.update(id, input, req.user!.sub);

  res.json({
    success: true,
    data: user,
  });
});

export const deactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = await usersService.deactivate(id, req.user!.sub);

  res.json({
    success: true,
    data: user,
    message: 'Usuario desativado com sucesso',
  });
});

export const reactivate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = await usersService.reactivate(id, req.user!.sub);

  res.json({
    success: true,
    data: user,
    message: 'Usuario reativado com sucesso',
  });
});

// Controllers para COMPANY_ADMIN
export const listCompanyUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { active, search, page, limit } = req.query;

  const filters = {
    active: active === 'true' ? true : active === 'false' ? false : undefined,
    search: search as string | undefined,
  };

  const result = await usersService.listByCompany(
    req.user!.companyId!,
    filters,
    Number(page) || 1,
    Number(limit) || 20
  );

  res.json({
    success: true,
    data: result,
  });
});

export const createCompanyUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, fullName, phone, avatarUrl } = req.body;

  const user = await usersService.createCompanyUser(
    req.user!.companyId!,
    { email, password, fullName, phone, avatarUrl },
    req.user!.sub
  );

  res.status(201).json({
    success: true,
    data: user,
  });
});
