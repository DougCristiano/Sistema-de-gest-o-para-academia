import { useState, useCallback, useMemo } from "react";

/**
 * Hook para buscar em dados por termo
 * @param data - Array de dados a buscar
 * @param searchFields - Campos onde buscar
 * @returns Estado e funções de busca
 */
export function useSearch<T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[] = []
) {
  const [searchTerm, setSearchTerm] = useState("");

  const results = useMemo(() => {
    if (!searchTerm.trim() || searchFields.length === 0) {
      return data;
    }

    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) {return false;}

        const stringValue = String(value).toLowerCase();
        return stringValue.includes(term);
      });
    });
  }, [data, searchTerm, searchFields]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  return {
    searchTerm,
    results,
    handleSearch,
    clearSearch,
    setSearchTerm,
  };
}
