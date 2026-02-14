import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import * as applicationsController from '../controllers/applications.controller.js';

const router = Router();

// Rotas requerem autenticacao
router.use(authenticate);

// Acessivel por qualquer usuario autenticado
router.get('/available', applicationsController.getAvailable);

// Gerar URL de acesso
router.post(
  '/access-token',
  authorize('COMPANY_ADMIN', 'COMPANY_SUPERVISOR', 'COMPANY_OPERATOR', 'SUPER_ADMIN'),
  applicationsController.getAccessUrl
);

export default router;
