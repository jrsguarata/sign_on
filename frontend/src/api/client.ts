import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Se o token expirou, tentar refresh
    // Nao interceptar rotas de autenticacao (login, refresh, logout)
    const url = originalRequest.url || '';
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Sem sessao ativa, propagar o erro original
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Refazer a requisicao original com o novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, fazer logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Tipos
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

// Funcoes de API

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ accessToken: string; refreshToken: string; user: User }>>('/auth/login', { email, password }),

  logout: (refreshToken: string) =>
    api.post<ApiResponse>('/auth/logout', { refreshToken }),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken }),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<ApiResponse>('/auth/change-password', { currentPassword, newPassword }),
};

// Public
export const publicApi = {
  getLandingContent: () =>
    api.get<ApiResponse<LandingContent[]>>('/public/landing/content'),

  getProducts: () =>
    api.get<ApiResponse<Product[]>>('/public/products'),

  getProductBySlug: (slug: string) =>
    api.get<ApiResponse<Product>>(`/public/products/${slug}`),

  getFaq: (category?: string) =>
    api.get<ApiResponse<Faq[]>>('/public/faq', { params: { category } }),

  submitContact: (data: ContactFormData) =>
    api.post<ApiResponse>('/public/contact', data),

  subscribeNewsletter: (email: string, fullName?: string) =>
    api.post<ApiResponse>('/public/newsletter/subscribe', { email, fullName }),
};

// Admin
export const adminApi = {
  // Companies
  getCompanies: (params?: { active?: boolean; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Company>>>('/admin/companies', { params }),

  getCompany: (id: string) =>
    api.get<ApiResponse<Company>>(`/admin/companies/${id}`),

  createCompany: (data: Partial<Company>) =>
    api.post<ApiResponse<Company>>('/admin/companies', data),

  updateCompany: (id: string, data: Partial<Company>) =>
    api.put<ApiResponse<Company>>(`/admin/companies/${id}`, data),

  deleteCompany: (id: string) =>
    api.delete<ApiResponse>(`/admin/companies/${id}`),

  reactivateCompany: (id: string) =>
    api.post<ApiResponse<Company>>(`/admin/companies/${id}/reactivate`),

  // Company Applications
  getCompanyApplications: (companyId: string) =>
    api.get<ApiResponse<CompanyApplication[]>>(`/admin/companies/${companyId}/applications`),

  linkApplication: (companyId: string, applicationId: string) =>
    api.post<ApiResponse<CompanyApplication>>(`/admin/companies/${companyId}/applications`, { applicationId }),

  unlinkApplication: (companyId: string, applicationId: string) =>
    api.delete<ApiResponse>(`/admin/companies/${companyId}/applications/${applicationId}`),

  // Applications
  getApplications: () =>
    api.get<ApiResponse<Application[]>>('/admin/applications'),

  createApplication: (data: Partial<Application>) =>
    api.post<ApiResponse<Application>>('/admin/applications', data),

  updateApplication: (id: string, data: Partial<Application>) =>
    api.put<ApiResponse<Application>>(`/admin/applications/${id}`, data),

  deleteApplication: (id: string) =>
    api.delete<ApiResponse>(`/admin/applications/${id}`),

  reactivateApplication: (id: string) =>
    api.post<ApiResponse<Application>>(`/admin/applications/${id}/reactivate`),

  // Users
  getUsers: (params?: { role?: string; companyId?: string; active?: boolean; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params }),

  createUser: (data: CreateUserData) =>
    api.post<ApiResponse<User>>('/admin/users', data),

  updateUser: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<ApiResponse>(`/admin/users/${id}`),

  reactivateUser: (id: string) =>
    api.post<ApiResponse<User>>(`/admin/users/${id}/reactivate`),

  // Contacts
  getContacts: (params?: { status?: string; assignedTo?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Contact>>>('/admin/contacts', { params }),

  getContact: (id: string) =>
    api.get<ApiResponse<Contact>>(`/admin/contacts/${id}`),

  updateContactStatus: (id: string, status: string) =>
    api.put<ApiResponse<Contact>>(`/admin/contacts/${id}/status`, { status }),

  assignContact: (id: string, userId: string | null) =>
    api.put<ApiResponse<Contact>>(`/admin/contacts/${id}/assign`, { userId }),

  getContactStats: () =>
    api.get<ApiResponse<ContactStats>>('/admin/contacts/stats'),
};

// Company
export const companyApi = {
  getUsers: (params?: { active?: boolean; search?: string; page?: number; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<User>>>('/company/users', { params }),

  createUser: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    api.post<ApiResponse<User>>('/company/users', data),

  updateUser: (id: string, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/company/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<ApiResponse>(`/company/users/${id}`),

  reactivateUser: (id: string) =>
    api.post<ApiResponse<User>>(`/company/users/${id}/reactivate`),

  getInfo: () =>
    api.get<ApiResponse<Company>>('/company/info'),

  updateInfo: (data: { phone?: string; address?: string }) =>
    api.put<ApiResponse<Company>>('/company/info', data),

  getApplications: () =>
    api.get<ApiResponse<Application[]>>('/company/applications'),
};

// Apps
export const appsApi = {
  getAvailable: () =>
    api.get<ApiResponse<Application[]>>('/apps/available'),

  getAccessUrl: (applicationId: string) =>
    api.post<ApiResponse<{ url: string; applicationName: string }>>('/apps/access-token', { applicationId }),
};

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'COMPANY_OPERATOR';
  phone?: string;
  avatarUrl?: string;
  companyId?: string;
  companyName?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  createdByName?: string;
  updatedByName?: string;
  deactivatedByName?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  companyId?: string;
  phone?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  createdByName?: string;
  updatedByName?: string;
  deactivatedByName?: string;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  url: string;
  iconUrl?: string;
  apiKey?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  createdByName?: string;
  updatedByName?: string;
  deactivatedByName?: string;
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  message: string;
  interestedIn?: string;
  status: 'pending' | 'contacted' | 'converted' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  assignedUser?: { id: string; fullName: string; email: string };
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedByName?: string;
  contactedAt?: string;
  convertedAt?: string;
}

export interface CompanyApplication {
  id: string;
  companyId: string;
  applicationId: string;
  active: boolean;
  expiresAt?: string;
  application: Application;
}

export interface ContactStats {
  pending: number;
  contacted: number;
  converted: number;
  archived: number;
  total: number;
  conversionRate: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  priceMonthly?: number;
  priceYearly?: number;
  imageUrl?: string;
  iconUrl?: string;
  isFeatured: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface LandingContent {
  id: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  message: string;
  interestedIn?: string;
  products?: string[];
}

export default api;
