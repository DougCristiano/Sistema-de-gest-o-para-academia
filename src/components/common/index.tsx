import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Componente EmptyState genérico
 * Renderiza estado vazio customizável
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={`p-8 text-center ${className}`}>
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-6">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </Card>
  );
}
