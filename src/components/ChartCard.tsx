import React from "react";
import { Card } from "./ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <div className="w-full">{children}</div>
    </Card>
  );
};
