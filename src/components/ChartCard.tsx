import React from "react";
import { Card } from "./ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  className = "",
  accentColor,
}) => {
  return (
    <Card
      className={`p-6 ${accentColor ? "border-l-4" : ""} ${className}`}
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1 text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="w-full">{children}</div>
    </Card>
  );
};
