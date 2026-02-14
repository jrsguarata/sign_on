import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { hashPassword } from '../utils/password.js';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema.js';
import { parsePagination, calculatePages, resolveAuditUsers, resolveAuditUser } from '../utils/helpers.js';
import { UserFilters, PaginatedResponse } from '../types/index.js';
import { User, UserRole } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'passwordHash'>;

export class UsersService {
  // Listar usuarios
  async list(
    filters: UserFilters,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<UserWithoutPassword>> {
    const pagination = parsePagination(page, limit);

    const where: Record<string, unknown> = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { fullName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          phone: true,
          avatarUrl: true,
          active: true,
          lastLogin: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          deactivatedAt: true,
          deactivatedBy: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const withCompanyName = users.map(({ company, ...user }) => ({
      ...user,
      companyName: company?.name || null,
    }));

    const enriched = await resolveAuditUsers(withCompanyName as any[]);

    return {
      data: enriched as unknown as UserWithoutPassword[],
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: calculatePages(total, pagination.limit),
    };
  }

  // Obter usuario por ID
  async getById(id: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        active: true,
        lastLogin: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        deactivatedAt: true,
        deactivatedBy: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    const { company, ...userData } = user;
    const withCompanyName = { ...userData, companyName: company?.name || null };

    return await resolveAuditUser(withCompanyName as any) as unknown as UserWithoutPassword;
  }

  // Criar usuario
  async create(input: CreateUserInput, createdById: string): Promise<UserWithoutPassword> {
    // Verificar email unico
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new AppError('Email ja cadastrado', 400, 'EMAIL_ALREADY_EXISTS');
    }

    // Verificar se companhia existe (se fornecida)
    if (input.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: input.companyId },
      });

      if (!company || !company.active) {
        throw new AppError('Companhia nao encontrada ou inativa', 400, 'COMPANY_NOT_FOUND');
      }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        companyId: input.companyId,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
        createdBy: createdById,
        updatedBy: createdById,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        active: true,
        lastLogin: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        deactivatedAt: true,
        deactivatedBy: true,
      },
    });

    return user as unknown as UserWithoutPassword;
  }

  // Atualizar usuario
  async update(
    id: string,
    input: UpdateUserInput,
    updatedById: string
  ): Promise<UserWithoutPassword> {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    // Verificar email unico se alterado
    if (input.email && input.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (emailExists) {
        throw new AppError('Email ja cadastrado', 400, 'EMAIL_ALREADY_EXISTS');
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...input,
        updatedBy: updatedById,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        active: true,
        lastLogin: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        deactivatedAt: true,
        deactivatedBy: true,
      },
    });

    return user as unknown as UserWithoutPassword;
  }

  // Desativar usuario (soft delete)
  async deactivate(id: string, deactivatedById: string): Promise<UserWithoutPassword> {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    // Nao permitir desativar o proprio usuario
    if (id === deactivatedById) {
      throw new AppError('Voce nao pode desativar seu proprio usuario', 400, 'CANNOT_DEACTIVATE_SELF');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        active: false,
        deactivatedAt: new Date(),
        deactivatedBy: deactivatedById,
        updatedBy: deactivatedById,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        active: true,
        lastLogin: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        deactivatedAt: true,
        deactivatedBy: true,
      },
    });

    // Revogar todos os tokens do usuario
    await prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { revoked: true },
    });

    return user as unknown as UserWithoutPassword;
  }

  // Reativar usuario
  async reactivate(id: string, reactivatedById: string): Promise<UserWithoutPassword> {
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        active: true,
        deactivatedAt: null,
        deactivatedBy: null,
        updatedBy: reactivatedById,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        active: true,
        lastLogin: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        deactivatedAt: true,
        deactivatedBy: true,
      },
    });

    return user as unknown as UserWithoutPassword;
  }

  // Listar usuarios de uma companhia (para COMPANY_ADMIN)
  async listByCompany(
    companyId: string,
    filters: UserFilters,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<UserWithoutPassword>> {
    return this.list({ ...filters, companyId }, page, limit);
  }

  // Criar usuario da companhia (para COMPANY_ADMIN)
  async createCompanyUser(
    companyId: string,
    input: Omit<CreateUserInput, 'companyId' | 'role'>,
    createdById: string
  ): Promise<UserWithoutPassword> {
    return this.create(
      {
        ...input,
        companyId,
        role: 'COMPANY_OPERATOR' as UserRole,
      },
      createdById
    );
  }
}

export const usersService = new UsersService();
