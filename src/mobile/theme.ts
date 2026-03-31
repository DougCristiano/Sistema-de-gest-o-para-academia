/**
 * Mobile Theme - Design tokens para versão mobile
 * Paleta moderna com cores vibrantes e dark accents
 */

export const mobileTheme = {
  colors: {
    // Primary palette
    primary: "#6366f1", // Indigo - Huron brand
    primaryLight: "#818cf8",
    primaryDark: "#4f46e5",

    // Secondary & Accent
    secondary: "#8b5cf6", // Purple
    accent: "#ec4899", // Pink
    success: "#10b981", // Green
    warning: "#f59e0b", // Amber
    error: "#ef4444", // Red

    // Backgrounds
    background: "#f8fafc", // Light slate
    backgroundSecondary: "#f1f5f9",
    surface: "#ffffff",
    surfaceHover: "#f1f5f9",

    // Text
    textPrimary: "#1e293b", // Slate dark
    textSecondary: "#64748b", // Slate medium
    textTertiary: "#94a3b8", // Slate light

    // Borders & Dividers
    border: "#e2e8f0", // Subtle border
    divider: "#cbd5e1",

    // Dark mode (future)
    dark: {
      background: "#1e293b",
      surface: "#0f172a",
      text: "#f1f5f9",
    },
  },

  // Gradients
  gradients: {
    primary: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    primaryAlt: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    success: "linear-gradient(135deg, #10b981, #14b8a6)",
    warm: "linear-gradient(135deg, #f59e0b, #ec4899)",
  },

  // Spacing scale
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
  },

  // Typography
  typography: {
    h1: {
      fontSize: "28px",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "24px",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "20px",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "18px",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    bodySmall: {
      fontSize: "14px",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "12px",
      fontWeight: 500,
      lineHeight: 1.4,
    },
  },

  // Border radius
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },

  // Viewport sizes
  viewport: {
    mobile: "320px",
    tablet: "768px",
    desktop: "1024px",
  },
} as const;

// Export type-safe theme
export type MobileTheme = typeof mobileTheme;
