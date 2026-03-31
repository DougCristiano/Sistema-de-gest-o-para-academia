import React from "react";
import { Button } from "../ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

interface Action<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (field: keyof T, direction: "asc" | "desc") => void;
  actions?: Action<T>[];
  sortField?: keyof T | null;
  sortDir?: "asc" | "desc";
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
}

/**
 * Componente DataTable genérico
 * Renderiza tabela com dados, sorting, e ações customizáveis
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onSort,
  actions,
  sortField,
  sortDir,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-gray-500">Nenhum registro encontrado</p>
      </div>
    );
  }

  const handleHeaderClick = (column: Column<T>) => {
    if (column.sortable && onSort) {
      const newDir = sortField === column.key && sortDir === "asc" ? "desc" : "asc";
      onSort(column.key, newDir);
    }
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable || sortField !== column.key) {return null;}

    return sortDir === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`text-left px-4 py-3 font-semibold text-sm ${
                  column.sortable ? "cursor-pointer hover:bg-gray-50" : ""
                }`}
                onClick={() => handleHeaderClick(column)}
                style={{ width: column.width }}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="text-left px-4 py-3 font-semibold text-sm">Ações</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={`border-b hover:bg-gray-50 ${
                rowClassName ? rowClassName(item, index) : ""
              } ${onRowClick ? "cursor-pointer" : ""}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-4 py-3 text-sm"
                  style={{ width: column.width }}
                >
                  {column.render ? column.render(item[column.key], item) : String(item[column.key])}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    {actions.map((action, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant={action.variant || "ghost"}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(item);
                        }}
                        title={action.label}
                        className={action.className}
                      >
                        <action.icon className="w-4 h-4" />
                      </Button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
