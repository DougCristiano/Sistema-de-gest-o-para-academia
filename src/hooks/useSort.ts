import { useState, useCallback, useMemo } from "react";

type SortDirection = "asc" | "desc";

/**
 * Hook para ordenar dados por um campo
 * @param data - Array de dados a ordenar
 * @param defaultField - Campo padrão para ordenação
 * @param defaultDirection - Direção padrão (asc/desc)
 * @returns Estado e funções de ordenação
 */
export function useSort<T extends Record<string, any>>(
  data: T[],
  defaultField?: keyof T,
  defaultDirection: SortDirection = "asc"
) {
  const [sortField, setSortField] = useState<keyof T | null>(defaultField || null);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultDirection);

  const sorted = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Tratamento especial para datas
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDir === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Comparação para strings e números
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDir === "asc"
          ? aValue.localeCompare(bValue, "pt-BR")
          : bValue.localeCompare(aValue, "pt-BR");
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDir === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortField, sortDir]);

  const toggleSort = useCallback((field: keyof T) => {
    setSortField((prev) => {
      if (prev === field) {
        // Se clicou no mesmo campo, muda direção
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return field;
      }
      // Novo campo, volta para asc
      setSortDir("asc");
      return field;
    });
  }, []);

  const clearSort = useCallback(() => {
    setSortField(null);
    setSortDir("asc");
  }, []);

  return {
    sortField,
    sortDir,
    sorted,
    toggleSort,
    clearSort,
    setSortField,
    setSortDir,
  };
}
