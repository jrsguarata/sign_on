import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

export class UserApplicationsService {
  // Listar aplicacoes atribuidas a um usuario
  async listByUser(userId: string) {
    const userApps = await prisma.userApplication.findMany({
      where: { userId },
      include: {
        application: true,
      },
    });

    return userApps
      .filter((ua) => ua.application.active)
      .map((ua) => ua.application);
  }

  // Sincronizar aplicacoes de um usuario (adiciona novas, remove as que nao estao na lista)
  async syncUserApps(userId: string, applicationIds: string[], adminId: string) {
    // Buscar o usuario para validar empresa
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.companyId) {
      throw new AppError('Usuario nao encontrado', 404, 'USER_NOT_FOUND');
    }

    if (user.role !== 'COMPANY_OPERATOR') {
      throw new AppError('Apenas operadores podem ter aplicacoes atribuidas individualmente', 400, 'INVALID_ROLE');
    }

    // Validar que todas as applicationIds pertencem as CompanyApplications ativas da empresa
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

    // Criar novas atribuicoes
    if (applicationIds.length > 0) {
      await prisma.userApplication.createMany({
        data: applicationIds.map((applicationId) => ({
          userId,
          applicationId,
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
