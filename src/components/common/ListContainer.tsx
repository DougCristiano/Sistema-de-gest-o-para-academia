import React from "react";

interface ListContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  toolbar?: React.ReactNode;
}

/**
 * Componente ListContainer genérico
 * Wrapper reutilizável para páginas com listas
 */
export function ListContainer({
  title,
  subtitle,
  children,
  headerAction,
  toolbar,
}: ListContainerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Toolbar (filtros, busca, etc) */}
      {toolbar && <div>{toolbar}</div>}

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
