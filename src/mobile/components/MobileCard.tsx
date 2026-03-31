import React from "react";
import { mobileTheme } from "../theme";

interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean;
  interactive?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  gradient = false,
  interactive = false,
  children,
  className,
  ...props
}) => {
  const style = {
    background: gradient ? mobileTheme.gradients.primary : mobileTheme.colors.surface,
    borderRadius: mobileTheme.borderRadius.lg,
    padding: mobileTheme.spacing.lg,
    marginBottom: mobileTheme.spacing.md,
    boxShadow: mobileTheme.shadows.sm,
    border: `1px solid ${mobileTheme.colors.border}`,
    color: gradient ? "white" : mobileTheme.colors.textPrimary,
    transition: interactive ? "transform 0.2s, box-shadow 0.2s" : "none",
    cursor: interactive ? "pointer" : "default",
  };

  return (
    <div style={style} className={className} {...props}>
      {children}
    </div>
  );
};
