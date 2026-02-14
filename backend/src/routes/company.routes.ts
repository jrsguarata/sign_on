import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize, validateCompanyScope } from '../middlewares/authorize.js';
import * as usersController from '../controllers/users.controller.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { Response } from 'express';
import { userApplicationsService } from '../services/user-applications.service.js';

const router = Router();

// Todas as rotas requerem autenticacao e role COMPANY_ADMIN
router.use(authenticate);
router.use(authorize('COMPANY_ADMIN'));
router.use(validateCompanyScope);

// === USUARIOS DA COMPANHIA ===
router.get('/users', usersController.listCompanyUsers);
router.post('/users', usersController.createCompanyUser);
router.put('/users/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  // Verificar se o usuario pertence a mesma companhia
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.companyId !== req.user!.companyId) {
    res.status(403).json({
      success: false,
      error: 'Acesso negado',
      code: 'FORBIDDEN',
    });
    return;
  }
  next();
}, usersController.update);

router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.companyId !== req.user!.companyId) {
    res.status(403).json({
      success: false,
      error: 'Acesso negado',
      code: 'FORBIDDEN',
    });
    return;
  }
  // Nao permitir desativar COMPANY_ADMIN
  if (user.role === 'COMPANY_ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Nao e possivel desativar um administrador',
      code: 'CANNOT_DEACTIVATE_ADMIN',
    });
    return;
  }
  next();
}, usersController.deactivate);

router.post('/users/:id/reactivate', async (req: AuthenticatedRequest, res: Response, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user || user.companyId !== req.user!.companyId) {
    res.status(403).json({
      success: false,
      error: 'Acesso negado',
      code: 'FORBIDDEN',
    });
    return;
  }
  next();
}, usersController.reactivate);

// === INFORMACOES DA COMPANHIA ===
router.get('/info', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const company = await prisma.company.findUnique({
    where: { id: req.user!.companyId! },
    include: {
      companyApplications: {
        where: { active: true },
        include: {
          application: {
            select: {
              id: true,
              name: true,
              description: true,
              iconUrl: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    data: company,
  });
}));

router.put('/info', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { phone, address } = req.body;

  const company = await prisma.company.update({
    where: { id: req.user!.companyId! },
    data: {
      phone,
      address,
      updatedBy: req.user!.sub,
    },
  });

  res.json({
    success: true,
    data: company,
  });
}));

// === APLICACOES CONTRATADAS ===
router.get('/applications', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const applications = await prisma.companyApplication.findMany({
    where: {
      companyId: req.user!.companyId!,
      active: true,
    },
    include: {
      application: true,
    },
  });

  res.json({
    success: true,
    data: applications.map((ca) => ca.application),
  });
}));

// === APLICACOES POR USUARIO ===
router.get('/users/:userId/applications', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  // Verificar que o usuario pertence a mesma empresa
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.companyId !== req.user!.companyId) {
    res.status(403).json({ success: false, error: 'Acesso negado', code: 'FORBIDDEN' });
    return;
  }

  if (user.role !== 'COMPANY_OPERATOR' && user.role !== 'COMPANY_COORDINATOR' && user.role !== 'COMPANY_SUPERVISOR') {
    res.status(400).json({ success: false, error: 'Apenas operadores, coordenadores e supervisores possuem aplicacoes individuais', code: 'INVALID_ROLE' });
    return;
  }

  const applications = await userApplicationsService.listByUser(userId);
  res.json({ success: true, data: applications });
}));

router.put('/users/:userId/applications', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { applications } = req.body;

  if (!Array.isArray(applications)) {
    res.status(400).json({ success: false, error: 'applications deve ser um array de {applicationId, role}', code: 'INVALID_INPUT' });
    return;
  }

  // Verificar que o usuario pertence a mesma empresa
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.companyId !== req.user!.companyId) {
    res.status(403).json({ success: false, error: 'Acesso negado', code: 'FORBIDDEN' });
    return;
  }

  if (user.role !== 'COMPANY_OPERATOR' && user.role !== 'COMPANY_COORDINATOR' && user.role !== 'COMPANY_SUPERVISOR') {
    res.status(400).json({ success: false, error: 'Apenas operadores, coordenadores e supervisores podem ter aplicacoes atribuidas', code: 'INVALID_ROLE' });
    return;
  }

  const result = await userApplicationsService.syncUserApps(userId, applications, req.user!.sub);
  res.json({ success: true, data: result });
}));

export default router;
