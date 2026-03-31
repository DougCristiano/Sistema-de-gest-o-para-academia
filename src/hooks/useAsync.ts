import { useState, useCallback, useEffect } from "react";

interface UseAsyncOptions {
  /** Executar função automaticamente no mount */
  immediate?: boolean;
  /** URL ou identificador da requisição */
  cacheKey?: string;
}

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para gerenciar estado de operações assíncronas
 * Útil para integração futura com backend
 *
 * @param asyncFunction - Função async a executar
 * @param options - Opções de configuração
 * @returns Estado e funções
 *
 * @example
 * const { data, loading, error, run } = useAsync(() => {
 *   return usersService.getAllUsers();
 * }, { immediate: true });
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncState<T> & {
  run: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = false, cacheKey: _cacheKey } = options;

  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Executar função async
  const run = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
    }
  }, [asyncFunction]);

  // Resetar estado
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // Executar automaticamente no mount se immediate=true
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (immediate) {
      run();
    }
  }, [immediate, run]);

  return {
    ...state,
    run,
    reset,
  };
}
