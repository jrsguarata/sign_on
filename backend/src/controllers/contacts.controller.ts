import { Response } from 'express';
import { contactsService } from '../services/contacts.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  createContactSchema,
  updateContactStatusSchema,
  assignContactSchema,
  updateContactNotesSchema,
  createInteractionSchema,
} from '../schemas/contact.schema.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export const list = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, assignedTo, search, page, limit } = req.query;

  const filters = {
    status: status as string | undefined,
    assignedTo: assignedTo as string | undefined,
    search: search as string | undefined,
  };

  const result = await contactsService.list(
    filters,
    Number(page) || 1,
    Number(limit) || 20
  );

  res.json({
    success: true,
    data: result,
  });
});

export const getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const contact = await contactsService.getById(id);

  res.json({
    success: true,
    data: contact,
  });
});

export const create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const input = createContactSchema.parse(req.body);
  const ipAddress = req.ip || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  const contact = await contactsService.create(input, ipAddress, userAgent);

  res.status(201).json({
    success: true,
    data: contact,
    message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
  });
});

export const updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = updateContactStatusSchema.parse(req.body);
  const contact = await contactsService.updateStatus(id, input, req.user!.sub);

  res.json({
    success: true,
    data: contact,
  });
});

export const assign = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { userId } = assignContactSchema.parse(req.body);
  const contact = await contactsService.assign(id, userId, req.user!.sub);

  res.json({
    success: true,
    data: contact,
  });
});

export const updateNotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { notes } = updateContactNotesSchema.parse(req.body);
  const contact = await contactsService.updateNotes(id, notes ?? null, req.user!.sub);

  res.json({
    success: true,
    data: contact,
  });
});

export const addInteraction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const input = createInteractionSchema.parse(req.body);
  const interaction = await contactsService.addInteraction(id, input, req.user!.sub);

  res.status(201).json({
    success: true,
    data: interaction,
  });
});

export const getInteractions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const interactions = await contactsService.getInteractions(id);

  res.json({
    success: true,
    data: interactions,
  });
});

export const getStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await contactsService.getStats();

  res.json({
    success: true,
    data: stats,
  });
});
