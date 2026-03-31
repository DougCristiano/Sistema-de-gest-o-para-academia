import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage?: (page: number) => void;
  itemsCount?: number;
  pageSize?: number;
}

/**
 * Componente PaginationControls genérico
 * Controles reutilizáveis de paginação
 */
export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onGoToPage,
  itemsCount,
  pageSize,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * (pageSize || 10) + 1;
  const endItem = Math.min(currentPage * (pageSize || 10), itemsCount || 0);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {itemsCount && pageSize ? (
          <span>
            Exibindo {startItem} a {endItem} de {itemsCount} registros
          </span>
        ) : (
          <span>
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          Próximo
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
