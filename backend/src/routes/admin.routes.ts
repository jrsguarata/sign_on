import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { authorize } from '../middlewares/authorize.js';
import * as companiesController from '../controllers/companies.controller.js';
import * as usersController from '../controllers/users.controller.js';
import * as applicationsController from '../controllers/applications.controller.js';
import * as contactsController from '../controllers/contacts.controller.js';
import * as productsController from '../controllers/products.controller.js';
import * as faqController from '../controllers/faq.controller.js';
import * as landingController from '../controllers/landing.controller.js';

const router = Router();

// Todas as rotas admin requerem autenticacao e role SUPER_ADMIN
router.use(authenticate);
router.use(authorize('SUPER_ADMIN'));

// === COMPANHIAS ===
router.get('/companies', companiesController.list);
router.get('/companies/:id', companiesController.getById);
router.post('/companies', companiesController.create);
router.put('/companies/:id', companiesController.update);
router.delete('/companies/:id', companiesController.deactivate);
router.post('/companies/:id/reactivate', companiesController.reactivate);

// Vincular/desvincular aplicacoes
router.get('/companies/:id/applications', companiesController.getApplications);
router.post('/companies/:id/applications', companiesController.linkApplication);
router.delete('/companies/:companyId/applications/:appId', companiesController.unlinkApplication);

// === APLICACOES ===
router.get('/applications', applicationsController.listAll);
router.get('/applications/:id', applicationsController.getById);
router.post('/applications', applicationsController.create);
router.put('/applications/:id', applicationsController.update);
router.delete('/applications/:id', applicationsController.deactivate);
router.post('/applications/:id/reactivate', applicationsController.reactivate);
router.post('/applications/:id/regenerate-key', applicationsController.regenerateApiKey);

// === USUARIOS ===
router.get('/users', usersController.list);
router.get('/users/:id', usersController.getById);
router.post('/users', usersController.create);
router.put('/users/:id', usersController.update);
router.delete('/users/:id', usersController.deactivate);
router.post('/users/:id/reactivate', usersController.reactivate);

// === LEADS/CONTATOS ===
router.get('/contacts', contactsController.list);
router.get('/contacts/stats', contactsController.getStats);
router.get('/contacts/:id', contactsController.getById);
router.put('/contacts/:id/status', contactsController.updateStatus);
router.put('/contacts/:id/priority', contactsController.updatePriority);
router.put('/contacts/:id/assign', contactsController.assign);
router.put('/contacts/:id/notes', contactsController.updateNotes);
router.get('/contacts/:id/interactions', contactsController.getInteractions);
router.post('/contacts/:id/interactions', contactsController.addInteraction);

// === PRODUTOS ===
router.get('/products', productsController.listAll);
router.get('/products/:id', productsController.getById);
router.post('/products', productsController.create);
router.put('/products/:id', productsController.update);
router.delete('/products/:id', productsController.deactivate);

// === FAQ ===
router.get('/faq', faqController.listAll);
router.get('/faq/:id', faqController.getById);
router.post('/faq', faqController.create);
router.put('/faq/:id', faqController.update);
router.delete('/faq/:id', faqController.deactivate);

// === CONTEUDO LANDING PAGE ===
router.get('/landing/content', landingController.listAllContent);
router.get('/landing/content/:id', landingController.getContentById);
router.post('/landing/content', landingController.createContent);
router.put('/landing/content/:id', landingController.updateContent);
router.delete('/landing/content/:id', landingController.deleteContent);

// === NEWSLETTER ===
router.get('/newsletter/subscribers', landingController.listSubscribers);

export default router;
