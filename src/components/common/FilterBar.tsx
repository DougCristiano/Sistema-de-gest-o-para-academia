import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, X } from "lucide-react";

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "text" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onFilterRemove?: (key: string) => void;
  filterConfigs: FilterConfig[];
  onClearAll?: () => void;
  showClearButton?: boolean;
}

/**
 * Componente FilterBar genérico
 * Renderiza barra de busca + filtros customizáveis
 */
export function FilterBar({
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  onFilterRemove,
  filterConfigs,
  onClearAll,
  showClearButton = true,
}: FilterBarProps) {
  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== ""
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {filterConfigs.map((config) => (
          <div key={config.key} className="flex gap-2 items-center">
            {config.type === "select" ? (
              <Select
                value={filters[config.key] || ""}
                onValueChange={(value) => onFilterChange(config.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={config.placeholder || config.label} />
                </SelectTrigger>
                <SelectContent>
                  {config.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type={config.type}
                placeholder={config.placeholder || config.label}
                value={filters[config.key] || ""}
                onChange={(e) => onFilterChange(config.key, e.target.value)}
                className="w-[180px]"
              />
            )}

            {filters[config.key] && onFilterRemove && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFilterRemove(config.key)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}

        {showClearButton && hasActiveFilters && onClearAll && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
          >
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
}
