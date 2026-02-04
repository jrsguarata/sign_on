import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { CreateCompanyInput, UpdateCompanyInput } from '../schemas/company.schema.js';
import { parsePagination, calculatePages, resolveAuditUsers, resolveAuditUser } from '../utils/helpers.js';
import { CompanyFilters, PaginatedResponse } from '../types/index.js';
import { Company } from '@prisma/client';

export class CompaniesService {
  // Listar companhias
  async list(
    filters: CompanyFilters,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<Company>> {
    const pagination = parsePagination(page, limit);

    const where: Record<string, unknown> = {};

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { cnpj: { contains: filters.search } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.company.count({ where }),
    ]);

    const enriched = await resolveAuditUsers(companies);

    return {
      data: enriched,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: calculatePages(total, pagination.limit),
    };
  }

  // Obter companhia por ID
  async getById(id: string): Promise<Company> {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          where: { active: true },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            lastLogin: true,
          },
        },
        companyApplications: {
          where: { active: true },
          include: {
            application: true,
          },
        },
      },
    });

    if (!company) {
      throw new AppError('Companhia nao encontrada', 404, 'COMPANY_NOT_FOUND');
    }

    return await resolveAuditUser(company as any) as any;
  }

  // Criar companhia
  async create(input: CreateCompanyInput, userId: string): Promise<Company> {
    // Verificar CNPJ unico se fornecido
    if (input.cnpj) {
      const existing = await prisma.company.findUnique({
        where: { cnpj: input.cnpj },
      });

      if (existing) {
        throw new AppError('CNPJ ja cadastrado', 400, 'CNPJ_ALREADY_EXISTS');
      }
    }

    const company = await prisma.company.create({
      data: {
        ...input,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return company;
  }

  // Atualizar companhia
  async update(id: string, input: UpdateCompanyInput, userId: string): Promise<Company> {
    const existing = await prisma.company.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Companhia nao encontrada', 404, 'COMPANY_NOT_FOUND');
    }

    // Verificar CNPJ unico se alterado
    if (input.cnpj && input.cnpj !== existing.cnpj) {
      const cnpjExists = await prisma.company.findUnique({
        where: { cnpj: input.cnpj },
      });

      if (cnpjExists) {
        throw new AppError('CNPJ ja cadastrado', 400, 'CNPJ_ALREADY_EXISTS');
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...input,
        updatedBy: userId,
      },
    });

    return company;
  }

  // Desativar companhia (soft delete)
  async deactivate(id: string, userId: string): Promise<Company> {
    const existing = await prisma.company.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Companhia nao encontrada', 404, 'COMPANY_NOT_FOUND');
    }

    // Desativar todos os usuarios da companhia
    await prisma.user.updateMany({
      where: { companyId: id },
      data: {
        active: false,
        deactivatedAt: new Date(),
        deactivatedBy: userId,
      },
    });

    const company = await prisma.company.update({
      where: { id },
      data: {
        active: false,
        deactivatedAt: new Date(),
        deactivatedBy: userId,
        updatedBy: userId,
      },
    });

    return company;
  }

  // Reativar companhia
  async reactivate(id: string, userId: string): Promise<Company> {
    const existing = await prisma.company.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Companhia nao encontrada', 404, 'COMPANY_NOT_FOUND');
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        active: true,
        deactivatedAt: null,
        deactivatedBy: null,
        updatedBy: userId,
      },
    });

    return company;
  }

  // Vincular aplicacao a companhia
  async linkApplication(
    companyId: string,
    applicationId: string,
    userId: string,
    expiresAt?: Date
  ) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new AppError('Companhia nao encontrada', 404, 'COMPANY_NOT_FOUND');
    }

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) {
      throw new AppError('Aplicacao nao encontrada', 404, 'APPLICATION_NOT_FOUND');
    }

    const existing = await prisma.companyApplication.findUnique({
      where: {
        companyId_applicationId: { companyId, applicationId },
      },
    });

    if (existing) {
      // Reativar se existir
      return prisma.companyApplication.update({
        where: { id: existing.id },
        data: {
          active: true,
          expiresAt,
          deactivatedAt: null,
          deactivatedBy: null,
          updatedBy: userId,
        },
        include: { application: true },
      });
    }

    return prisma.companyApplication.create({
      data: {
        companyId,
        applicationId,
        expiresAt,
        createdBy: userId,
        updatedBy: userId,
      },
      include: { application: true },
    });
  }

  // Desvincular aplicacao
  async unlinkApplication(companyId: string, applicationId: string, userId: string) {
    const link = await prisma.companyApplication.findUnique({
      where: {
        companyId_applicationId: { companyId, applicationId },
      },
    });

    if (!link) {
      throw new AppError('Vinculo nao encontrado', 404, 'LINK_NOT_FOUND');
    }

    return prisma.companyApplication.update({
      where: { id: link.id },
      data: {
        active: false,
        deactivatedAt: new Date(),
        deactivatedBy: userId,
        updatedBy: userId,
      },
    });
  }

  // Listar aplicacoes de uma companhia
  async getApplications(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new AppError('Companhia nao encontrada', 404, 'COMPANY_NOT_FOUND');
    }

    return prisma.companyApplication.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        application: true,
      },
    });
  }
}

export const companiesService = new CompaniesService();
