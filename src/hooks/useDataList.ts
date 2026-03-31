import { useMemo } from "react";
import { useFilter } from "./useFilter";
import { useSearch } from "./useSearch";
import { useSort } from "./useSort";
import { usePagination } from "./usePagination";

interface UseDataListOptions<T> {
  searchFields?: (keyof T)[];
  filterFields?: (keyof T)[];
  sortDefaultField?: keyof T;
  sortDefaultDir?: "asc" | "desc";
  pageSize?: number;
  initialFilters?: Record<string, any>;
}

/**
 * Hook combinado que integra filter, search, sort e pagination
 * Simplifica a reutilização em múltiplas páginas
 *
 * @param data - Array de dados
 * @param options - Configurações
 * @returns Todos os estados e funções
 *
 * @example
 * const { data, search, setSearch, filters, page, paginatedData } = useDataList(athletes, {
 *   searchFields: ['name', 'email'],
 *   filterFields: ['status', 'profile'],
 *   pageSize: 20
 * });
 */
export function useDataList<T extends Record<string, any>>(
  data: T[],
  options: UseDataListOptions<T> = {}
) {
  const {
    searchFields = [],
    filterFields = [],
    sortDefaultField = undefined,
    sortDefaultDir = "asc",
    pageSize = 10,
    initialFilters = {},
  } = options;

  // Aplicar filtros
  const filter = useFilter(data, initialFilters);

  // Aplicar busca nos resultados filtrados
  const search = useSearch(filter.filtered, searchFields);

  // Aplicar ordenação nos resultados buscados
  const sort = useSort(search.results, sortDefaultField, sortDefaultDir);

  // Aplicar paginação nos resultados ordenados
  const pagination = usePagination(sort.sorted, pageSize);

  // Retornar tudo de forma organizada
  return {
    // Dados
    data: pagination.paginatedData,
    allData: sort.sorted,
    itemsCount: pagination.itemsCount,
    filteredCount: filter.filtered.length,
    searchedCount: search.results.length,

    // Busca
    searchTerm: search.searchTerm,
    setSearch: search.handleSearch,
    clearSearch: search.clearSearch,

    // Filtros
    filters: filter.filters,
    addFilter: filter.addFilter,
    removeFilter: filter.removeFilter,
    clearFilters: filter.clearFilters,
    setFilters: filter.setFilters,

    // Ordenação
    sortField: sort.sortField,
    sortDir: sort.sortDir,
    toggleSort: sort.toggleSort,
    clearSort: sort.clearSort,

    // Paginação
    page: pagination.currentPage,
    totalPages: pagination.totalPages,
    goToPage: pagination.goToPage,
    nextPage: pagination.nextPage,
    previousPage: pagination.previousPage,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
  };
}
