import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { UserRole } from '@prisma/client';

interface UserAppAssignment {
  applicationId: string;
  role: UserRole;
}

const ALLOWED_APP_ROLES: UserRole[] = ['COMPANY_OPERATOR', 'COMPANY_SUPERVISOR'];

export class UserApplicationsService {
  // Listar aplicacoes atribuidas a um usuario (com appRole)
  async listByUser(userId: string) {
    const userApps = await prisma.userApplication.findMany({
      where: { userId },
      include: {
        application: true,
      },
    });

    return userApps
      .filter((ua) => ua.application.active)
      .map((ua) => ({
        ...ua.application,
        appRole: ua.role,
      }));
  }

  // Sincronizar aplicacoes de um usuario (adiciona novas, remove as que nao estao na lista)
  async syncUserApps(userId: string, applications: UserAppAssignment[], adminId: string) {
    // Buscar o usuario para validar empresa
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.companyId) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    if (user.role !== 'COMPANY_OPERATOR' && user.role !== 'COMPANY_SUPERVISOR') {
      throw new AppError('Apenas operadores e supervisores podem ter aplicacoes atribuidas individualmente', 400, 'INVALID_ROLE');
    }

    // Validar roles permitidas por app
    const invalidRoles = applications.filter((a) => !ALLOWED_APP_ROLES.includes(a.role));
    if (invalidRoles.length > 0) {
      throw new AppError('Roles invalidas para aplicacao. Permitidas: COMPANY_OPERATOR, COMPANY_SUPERVISOR', 400, 'INVALID_APP_ROLE');
    }

    // Validar que todas as applicationIds pertencem as CompanyApplications ativas da empresa
    const applicationIds = applications.map((a) => a.applicationId);
    if (applicationIds.length > 0) {
      const companyApps = await prisma.companyApplication.findMany({
        where: {
          companyId: user.companyId,
          active: true,
          applicationId: { in: applicationIds },
        },
      });

      const validAppIds = new Set(companyApps.map((ca) => ca.applicationId));
      const invalidIds = applicationIds.filter((id) => !validAppIds.has(id));

      if (invalidIds.length > 0) {
        throw new AppError('Algumas aplicacoes nao estao contratadas pela empresa', 400, 'INVALID_APPLICATIONS');
      }
    }

    // Remover todas as atribuicoes atuais
    await prisma.userApplication.deleteMany({
      where: { userId },
    });

    // Criar novas atribuicoes com role por app
    if (applications.length > 0) {
      await prisma.userApplication.createMany({
        data: applications.map((app) => ({
          userId,
          applicationId: app.applicationId,
          role: app.role,
          createdBy: adminId,
        })),
      });
    }

    // Retornar a lista atualizada
    return this.listByUser(userId);
  }

  // Remover todas as UserApplications de uma aplicacao para usuarios de uma empresa
  async removeByCompanyAndApp(companyId: string, applicationId: string) {
    // Buscar usuarios da empresa
    const companyUsers = await prisma.user.findMany({
      where: { companyId },
      select: { id: true },
    });

    const userIds = companyUsers.map((u) => u.id);

    if (userIds.length > 0) {
      await prisma.userApplication.deleteMany({
        where: {
          userId: { in: userIds },
          applicationId,
        },
      });
    }
  }
}

export const userApplicationsService = new UserApplicationsService();
