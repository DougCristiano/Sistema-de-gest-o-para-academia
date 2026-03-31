import { useState, useCallback, useMemo } from "react";

/**
 * Hook para filtrar dados por múltiplos campos
 * @param data - Array de dados a filtrar
 * @param initialFilters - Filtros iniciais
 * @returns Estado e funções de filtro
 */
export function useFilter<T extends Record<string, any>>(
  data: T[],
  initialFilters: Record<string, any> = {}
) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);

  const addFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null || value === "") return true;

        const itemValue = item[key];

        // Se é um array, verifica se contém o valor
        if (Array.isArray(itemValue)) {
          return itemValue.includes(value);
        }

        // Caso geral: comparação stricta
        return itemValue === value;
      });
    });
  }, [data, filters]);

  return {
    filters,
    filtered,
    addFilter,
    removeFilter,
    clearFilters,
    setFilters,
  };
}
