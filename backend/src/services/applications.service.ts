import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { generateApiKey, resolveAuditUsers, resolveAuditUser } from '../utils/helpers.js';
import { Application } from '@prisma/client';

interface CreateApplicationInput {
  name: string;
  description?: string | null;
  url: string;
  iconUrl?: string | null;
}

interface UpdateApplicationInput {
  name?: string;
  description?: string | null;
  url?: string;
  iconUrl?: string | null;
}

export class ApplicationsService {
  // Listar aplicacoes
  async list() {
    return prisma.application.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  // Listar todas (incluindo inativas) - para admin
  async listAll() {
    const apps = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return resolveAuditUsers(apps);
  }

  // Obter aplicacao por ID
  async getById(id: string): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        companyApplications: {
          where: { active: true },
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Aplicacao nao encontrada', 404, 'APPLICATION_NOT_FOUND');
    }

    return await resolveAuditUser(application as any) as any;
  }

  // Criar aplicacao
  async create(input: CreateApplicationInput, userId: string): Promise<Application> {
    const apiKey = generateApiKey();

    const application = await prisma.application.create({
      data: {
        ...input,
        apiKey,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return application;
  }

  // Atualizar aplicacao
  async update(id: string, input: UpdateApplicationInput, userId: string): Promise<Application> {
    const existing = await prisma.application.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Aplicacao nao encontrada', 404, 'APPLICATION_NOT_FOUND');
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...input,
        updatedBy: userId,
      },
    });

    return application;
  }

  // Desativar aplicacao
  async deactivate(id: string, userId: string): Promise<Application> {
    const existing = await prisma.application.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Aplicacao nao encontrada', 404, 'APPLICATION_NOT_FOUND');
    }

    // Desativar todos os vinculos com companhias
    await prisma.companyApplication.updateMany({
      where: { applicationId: id },
      data: {
        active: false,
        deactivatedAt: new Date(),
        deactivatedBy: userId,
      },
    });

    const application = await prisma.application.update({
      where: { id },
      data: {
        active: false,
        deactivatedAt: new Date(),
        deactivatedBy: userId,
        updatedBy: userId,
      },
    });

    return application;
  }

  // Reativar aplicacao
  async reactivate(id: string, userId: string): Promise<Application> {
    const existing = await prisma.application.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Aplicacao nao encontrada', 404, 'APPLICATION_NOT_FOUND');
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        active: true,
        deactivatedAt: null,
        deactivatedBy: null,
        updatedBy: userId,
      },
    });

    return application;
  }

  // Regenerar API Key
  async regenerateApiKey(id: string, userId: string): Promise<{ apiKey: string }> {
    const existing = await prisma.application.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Aplicacao nao encontrada', 404, 'APPLICATION_NOT_FOUND');
    }

    const newApiKey = generateApiKey();

    await prisma.application.update({
      where: { id },
      data: {
        apiKey: newApiKey,
        updatedBy: userId,
      },
    });

    return { apiKey: newApiKey };
  }

  // Listar aplicacoes disponiveis para um usuario
  async getAvailableForUser(userId: string, companyId: string | null, role: string) {
    if (!companyId) {
      // SUPER_ADMIN - acesso a todas
      return this.list();
    }

    if (role === 'COMPANY_OPERATOR' || role === 'COMPANY_COORDINATOR' || role === 'COMPANY_SUPERVISOR') {
      // Operador/Coordenador/Supervisor - apenas aplicacoes atribuidas individualmente (que tambem sao contratadas pela empresa)
      const userApps = await prisma.userApplication.findMany({
        where: { userId },
        include: {
          application: {
            include: {
              companyApplications: {
                where: {
                  companyId,
                  active: true,
                  OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                  ],
                },
              },
            },
          },
        },
      });

      return userApps
        .filter((ua) => ua.application.active && ua.application.companyApplications.length > 0)
        .map((ua) => {
          const { companyApplications, ...app } = ua.application;
          return app;
        });
    }

    // COMPANY_ADMIN - todas as aplicacoes contratadas pela empresa
    const companyApps = await prisma.companyApplication.findMany({
      where: {
        companyId,
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        application: true,
      },
    });

    return companyApps
      .filter((ca) => ca.application.active)
      .map((ca) => ca.application);
  }

  // Gerar URL de acesso com token
  async generateAccessUrl(applicationId: string, userId: string, companyId: string | null, role: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || !application.active) {
      throw new AppError('Aplicacao nao encontrada ou inativa', 404, 'APPLICATION_NOT_FOUND');
    }

    // Verificar se o usuario tem acesso
    if (companyId) {
      const hasCompanyAccess = await prisma.companyApplication.findFirst({
        where: {
          companyId,
          applicationId,
          active: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      if (!hasCompanyAccess) {
        throw new AppError('Usuario nao tem acesso a esta aplicacao', 403, 'NO_ACCESS');
      }

      // Para operadores, coordenadores e supervisores, verificar tambem a atribuicao individual
      if (role === 'COMPANY_OPERATOR' || role === 'COMPANY_COORDINATOR' || role === 'COMPANY_SUPERVISOR') {
        const hasUserAccess = await prisma.userApplication.findUnique({
          where: {
            userId_applicationId: { userId, applicationId },
          },
        });

        if (!hasUserAccess) {
          throw new AppError('Usuario nao tem acesso a esta aplicacao', 403, 'NO_ACCESS');
        }
      }
    }

    // Log de acesso
    await prisma.accessLog.create({
      data: {
        userId,
        applicationId,
        action: 'access_app',
      },
    });

    // Retornar URL base (o frontend vai adicionar o token)
    return {
      url: application.url,
      applicationName: application.name,
    };
  }
}

export const applicationsService = new ApplicationsService();
