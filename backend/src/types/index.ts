import { UserRole } from '@prisma/client';
import { Request } from 'express';

// ============================================
// TIPOS DE AUTENTICACAO
// ============================================

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string | null;
  companyName: string | null;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

// ============================================
// REQUEST AUTENTICADO
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ============================================
// RESPOSTAS DA API
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============================================
// PARAMETROS DE PAGINACAO
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// ============================================
// FILTROS
// ============================================

export interface UserFilters {
  role?: UserRole;
  companyId?: string;
  active?: boolean;
  search?: string;
}

export interface CompanyFilters {
  active?: boolean;
  search?: string;
}

export interface ContactFilters {
  status?: string;
  assignedTo?: string;
  search?: string;
}

// ============================================
// ESTATISTICAS
// ============================================

export interface ContactStats {
  pending: number;
  contacted: number;
  archived: number;
  total: number;
}

export interface DashboardStats {
  totalCompanies: number;
  totalUsers: number;
  totalApplications: number;
  totalContacts: number;
  recentContacts: number;
  activeUsers: number;
}
