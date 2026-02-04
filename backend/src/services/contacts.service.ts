import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  CreateContactInput,
  UpdateContactStatusInput,
  CreateInteractionInput,
} from '../schemas/contact.schema.js';
import { parsePagination, calculatePages, resolveAuditUsers } from '../utils/helpers.js';
import { ContactFilters, PaginatedResponse, ContactStats } from '../types/index.js';
import { ContactRequest, ContactStatus, ContactPriority } from '@prisma/client';

export class ContactsService {
  // Listar contatos/leads
  async list(
    filters: ContactFilters,
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<ContactRequest>> {
    const pagination = parsePagination(page, limit);

    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status as ContactStatus;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo === 'unassigned' ? null : filters.assignedTo;
    }

    if (filters.priority) {
      where.priority = filters.priority as ContactPriority;
    }

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { companyName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contactRequest.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          assignedUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.contactRequest.count({ where }),
    ]);

    const enriched = await resolveAuditUsers(contacts as any[]);

    return {
      data: enriched,
      total,
      page: pagination.page,
      limit: pagination.limit,
      pages: calculatePages(total, pagination.limit),
    };
  }

  // Obter contato por ID
  async getById(id: string) {
    const contact = await prisma.contactRequest.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!contact) {
      throw new AppError('Contato nao encontrado', 404, 'CONTACT_NOT_FOUND');
    }

    return contact;
  }

  // Criar contato (da landing page)
  async create(input: CreateContactInput, ipAddress?: string, userAgent?: string) {
    const contact = await prisma.contactRequest.create({
      data: {
        ...input,
        ipAddress,
        userAgent,
      },
    });

    return contact;
  }

  // Atualizar status
  async updateStatus(id: string, input: UpdateContactStatusInput, userId: string) {
    const contact = await prisma.contactRequest.findUnique({ where: { id } });

    if (!contact) {
      throw new AppError('Contato nao encontrado', 404, 'CONTACT_NOT_FOUND');
    }

    const updateData: Record<string, unknown> = {
      status: input.status,
      updatedBy: userId,
    };

    // Marcar datas especiais baseado no status
    if (input.status === 'contacted' && !contact.contactedAt) {
      updateData.contactedAt = new Date();
    }

    if (input.status === 'converted' && !contact.convertedAt) {
      updateData.convertedAt = new Date();
    }

    return prisma.contactRequest.update({
      where: { id },
      data: updateData,
    });
  }

  // Atualizar prioridade
  async updatePriority(id: string, priority: ContactPriority, userId: string) {
    const contact = await prisma.contactRequest.findUnique({ where: { id } });

    if (!contact) {
      throw new AppError('Contato nao encontrado', 404, 'CONTACT_NOT_FOUND');
    }

    return prisma.contactRequest.update({
      where: { id },
      data: {
        priority,
        updatedBy: userId,
      },
    });
  }

  // Atribuir contato a um usuario
  async assign(id: string, assignedTo: string | null, userId: string) {
    const contact = await prisma.contactRequest.findUnique({ where: { id } });

    if (!contact) {
      throw new AppError('Contato nao encontrado', 404, 'CONTACT_NOT_FOUND');
    }

    if (assignedTo) {
      const user = await prisma.user.findUnique({ where: { id: assignedTo } });
      if (!user || !user.active) {
        throw new AppError('Usuario nao encontrado ou inativo', 400, 'USER_NOT_FOUND');
      }
    }

    return prisma.contactRequest.update({
      where: { id },
      data: {
        assignedTo,
        updatedBy: userId,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  // Atualizar notas
  async updateNotes(id: string, notes: string | null, userId: string) {
    const contact = await prisma.contactRequest.findUnique({ where: { id } });

    if (!contact) {
      throw new AppError('Contato nao encontrado', 404, 'CONTACT_NOT_FOUND');
    }

    return prisma.contactRequest.update({
      where: { id },
      data: {
        notes,
        updatedBy: userId,
      },
    });
  }

  // Adicionar interacao
  async addInteraction(contactId: string, input: CreateInteractionInput, userId: string) {
    const contact = await prisma.contactRequest.findUnique({ where: { id: contactId } });

    if (!contact) {
      throw new AppError('Contato nao encontrado', 404, 'CONTACT_NOT_FOUND');
    }

    const interaction = await prisma.contactInteraction.create({
      data: {
        contactRequestId: contactId,
        userId,
        interactionType: input.interactionType,
        subject: input.subject,
        description: input.description,
        nextFollowupAt: input.nextFollowupAt ? new Date(input.nextFollowupAt) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Atualizar status para contacted se estiver pending
    if (contact.status === 'pending') {
      await prisma.contactRequest.update({
        where: { id: contactId },
        data: {
          status: 'contacted',
          contactedAt: new Date(),
          updatedBy: userId,
        },
      });
    }

    return interaction;
  }

  // Listar interacoes de um contato
  async getInteractions(contactId: string) {
    const contact = await prisma.contactRequest.findUnique({ where: { id: contactId } });

    if (!contact) {
      throw new AppError('Contato nao encontrado', 404, 'CONTACT_NOT_FOUND');
    }

    return prisma.contactInteraction.findMany({
      where: { contactRequestId: contactId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  // Obter estatisticas
  async getStats(): Promise<ContactStats> {
    const [pending, contacted, converted, archived, total] = await Promise.all([
      prisma.contactRequest.count({ where: { status: 'pending' } }),
      prisma.contactRequest.count({ where: { status: 'contacted' } }),
      prisma.contactRequest.count({ where: { status: 'converted' } }),
      prisma.contactRequest.count({ where: { status: 'archived' } }),
      prisma.contactRequest.count(),
    ]);

    const conversionRate = total > 0 ? (converted / total) * 100 : 0;

    return {
      pending,
      contacted,
      converted,
      archived,
      total,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }
}

export const contactsService = new ContactsService();
