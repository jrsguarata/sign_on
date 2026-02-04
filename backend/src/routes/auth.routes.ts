import { Router } from 'express';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// Rotas publicas
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/validate', authController.validateToken);

// Rotas protegidas
router.post('/logout', optionalAuth, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

export default router;
