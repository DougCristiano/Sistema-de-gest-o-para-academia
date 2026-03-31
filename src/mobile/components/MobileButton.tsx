import React from "react";
import { mobileTheme } from "../theme";

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  disabled,
  className,
  ...props
}) => {
  const baseStyles = `
    font-weight: 600;
    border: none;
    border-radius: ${mobileTheme.borderRadius.md};
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${mobileTheme.spacing.sm};
    font-family: inherit;
    ${fullWidth ? "width: 100%;" : ""}
    ${disabled || loading ? "opacity: 0.6; cursor: not-allowed;" : ""}
  `;

  const variantStyles = {
    primary: `
      background: ${mobileTheme.gradients.primary};
      color: white;
      &:active:not(:disabled) {
        opacity: 0.9;
        transform: scale(0.98);
      }
    `,
    secondary: `
      background: ${mobileTheme.colors.secondary};
      color: white;
      &:active:not(:disabled) {
        opacity: 0.9;
      }
    `,
    outline: `
      background: transparent;
      color: ${mobileTheme.colors.primary};
      border: 2px solid ${mobileTheme.colors.primary};
      &:active:not(:disabled) {
        background: ${mobileTheme.colors.primary}20;
      }
    `,
    ghost: `
      background: transparent;
      color: ${mobileTheme.colors.textPrimary};
      &:active:not(:disabled) {
        background: ${mobileTheme.colors.surfaceHover};
      }
    `,
  };

  const sizeStyles = {
    sm: `
      padding: ${mobileTheme.spacing.sm} ${mobileTheme.spacing.md};
      font-size: 14px;
    `,
    md: `
      padding: ${mobileTheme.spacing.md} ${mobileTheme.spacing.lg};
      font-size: 16px;
    `,
    lg: `
      padding: ${mobileTheme.spacing.lg} ${mobileTheme.spacing.xl};
      font-size: 18px;
    `,
  };

  const style = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
  } as any;

  return (
    <button
      style={style}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && (
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
};
