import { PaginationParams } from '../types/index.js';
import { prisma } from '../config/database.js';

// Resolver nomes de usuario para campos de auditoria (createdBy, updatedBy, deactivatedBy)
export async function resolveAuditUsers<T extends Record<string, unknown>>(
  items: T[]
): Promise<(T & { createdByName?: string; updatedByName?: string; deactivatedByName?: string })[]> {
  const userIds = new Set<string>();

  for (const item of items) {
    if (item.createdBy && typeof item.createdBy === 'string') userIds.add(item.createdBy);
    if (item.updatedBy && typeof item.updatedBy === 'string') userIds.add(item.updatedBy);
    if (item.deactivatedBy && typeof item.deactivatedBy === 'string') userIds.add(item.deactivatedBy);
  }

  if (userIds.size === 0) return items;

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
    select: { id: true, fullName: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  return items.map((item) => ({
    ...item,
    createdByName: item.createdBy ? userMap.get(item.createdBy as string) || undefined : undefined,
    updatedByName: item.updatedBy ? userMap.get(item.updatedBy as string) || undefined : undefined,
    deactivatedByName: item.deactivatedBy ? userMap.get(item.deactivatedBy as string) || undefined : undefined,
  }));
}

// Resolver nomes de auditoria para um unico item
export async function resolveAuditUser<T extends Record<string, unknown>>(
  item: T
): Promise<T & { createdByName?: string; updatedByName?: string; deactivatedByName?: string }> {
  const [resolved] = await resolveAuditUsers([item]);
  return resolved;
}

// Parsear parametros de paginacao
export function parsePagination(
  page?: string | number,
  limit?: string | number
): PaginationParams {
  const parsedPage = Math.max(1, parseInt(String(page || '1'), 10));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || '20'), 10)));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
}

// Calcular total de paginas
export function calculatePages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

// Gerar slug a partir de texto
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por -
    .replace(/^-+|-+$/g, ''); // Remove - do inicio e fim
}

// Gerar API Key aleatoria
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sk_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Sanitizar string (remover tags HTML)
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

// Formatar CNPJ
export function formatCnpj(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

// Validar CNPJ
export function validateCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  let pos = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(cleaned[12])) return false;

  sum = 0;
  pos = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(cleaned[13]);
}
