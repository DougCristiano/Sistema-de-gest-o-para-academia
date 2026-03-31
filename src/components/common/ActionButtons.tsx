import React from "react";
import { Button } from "../ui/button";
import { LucideIcon } from "lucide-react";

interface ActionButton {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

interface ActionButtonsProps {
  actions: ActionButton[];
  layout?: "horizontal" | "vertical";
}

/**
 * Componente ActionButtons genérico
 * Renderiza botões de ação (edit, delete, etc)
 */
export function ActionButtons({
  actions,
  layout = "horizontal",
}: ActionButtonsProps) {
  if (actions.length === 0) return null;

  const containerClass = layout === "horizontal" ? "flex gap-2" : "flex flex-col gap-2";

  return (
    <div className={containerClass}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "default"}
          size="sm"
          onClick={action.onClick}
          className={action.className}
          title={action.label}
        >
          <action.icon className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
