import { Router } from 'express';
import { contactLimiter, newsletterLimiter } from '../middlewares/rateLimiter.js';
import * as productsController from '../controllers/products.controller.js';
import * as faqController from '../controllers/faq.controller.js';
import * as landingController from '../controllers/landing.controller.js';
import * as contactsController from '../controllers/contacts.controller.js';

const router = Router();

// === LANDING PAGE CONTENT ===
router.get('/landing/content', landingController.listContent);

// === PRODUTOS ===
router.get('/products', productsController.list);
router.get('/products/:slug', productsController.getBySlug);

// === FAQ ===
router.get('/faq', faqController.list);
router.post('/faq/:id/view', faqController.incrementViews);
router.post('/faq/:id/helpful', faqController.markHelpful);

// === CONTATO ===
router.post('/contact', contactLimiter, contactsController.create);

// === NEWSLETTER ===
router.post('/newsletter/subscribe', newsletterLimiter, landingController.subscribeNewsletter);
router.post('/newsletter/unsubscribe', landingController.unsubscribeNewsletter);

export default router;
