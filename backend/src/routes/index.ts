import { Router } from 'express';
import authRoutes from './auth.routes.js';
import publicRoutes from './public.routes.js';
import adminRoutes from './admin.routes.js';
import companyRoutes from './company.routes.js';
import appsRoutes from './apps.routes.js';

const router = Router();

// Rotas publicas (sem autenticacao)
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);

// Rotas protegidas
router.use('/admin', adminRoutes);
router.use('/company', companyRoutes);
router.use('/apps', appsRoutes);

export default router;
