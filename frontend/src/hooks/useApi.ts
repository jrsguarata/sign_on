import { useState, useCallback } from 'react';
import { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse } from '../api/client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, P extends unknown[] = []>(
  apiFunc: (...params: P) => Promise<AxiosResponse<ApiResponse<T>>>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
  }
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunc(...params);

        if (response.data.success && response.data.data) {
          setState({ data: response.data.data, loading: false, error: null });

          if (options?.showSuccessToast) {
            toast.success(options.successMessage || response.data.message || 'Operacao realizada com sucesso!');
          }

          options?.onSuccess?.(response.data.data);
          return response.data.data;
        } else {
          throw new Error(response.data.error || 'Erro desconhecido');
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } }; message?: string };
        const message = err.response?.data?.error || err.message || 'Erro na requisicao';

        setState({ data: null, loading: false, error: message });

        if (options?.showErrorToast !== false) {
          toast.error(message);
        }

        options?.onError?.(message);
        return null;
      }
    },
    [apiFunc, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// Hook para paginacao
export function usePaginatedApi<T>(
  apiFunc: (params: { page: number; limit: number; [key: string]: unknown }) => Promise<AxiosResponse<ApiResponse<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>>>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetch = useCallback(
    async (params: { page?: number; limit?: number; [key: string]: unknown } = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunc({
          page: params.page || pagination.page,
          limit: params.limit || pagination.limit,
          ...params,
        });

        if (response.data.success && response.data.data) {
          setData(response.data.data.data);
          setPagination({
            page: response.data.data.page,
            limit: response.data.data.limit,
            total: response.data.data.total,
            pages: response.data.data.pages,
          });
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: string } }; message?: string };
        const message = error.response?.data?.error || error.message || 'Erro ao carregar dados';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, pagination.page, pagination.limit]
  );

  const goToPage = useCallback(
    (page: number) => {
      fetch({ page });
    },
    [fetch]
  );

  return {
    data,
    loading,
    error,
    pagination,
    fetch,
    goToPage,
  };
}
