import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, User } from '../api/client';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuario do localStorage no inicio
  // So restaura sessao se houver login nesta sessao do navegador
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!sessionStorage.getItem('session_active')) {
          // Sessao nova: limpar tokens antigos e exigir novo login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          return;
        }

        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          // Verificar se o token ainda e valido
          const response = await authApi.me();
          if (response.data.success && response.data.data) {
            setUser(response.data.data);
            localStorage.setItem('user', JSON.stringify(response.data.data));
          }
        }
      } catch (error) {
        // Token invalido, limpar dados
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password);

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user: userData } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('session_active', 'true');

        setUser(userData);
        toast.success('Login realizado com sucesso!');
        return true;
      }

      return false;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const message = err.response?.data?.error || 'Erro ao fazer login';
      toast.error(message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    // Limpar dados locais ANTES da chamada API
    // para que o interceptor nao envie token expirado
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('session_active');
    setUser(null);

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignorar erro no logout - sessao local ja foi limpa
    }

    toast.success('Logout realizado com sucesso!');
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('session_active');
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}
