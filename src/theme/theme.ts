// Theme configuration for Light and Dark modes
// Complete color palette for the Huron Academy Management System

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Primary Colors (Verde - Huron Areia)
  primary: {
    light: string;
    main: string;
    dark: string;
    lighter: string;
    darker: string;
  };

  // Secondary Colors (Azul - Huron Personal)
  secondary: {
    light: string;
    main: string;
    dark: string;
    lighter: string;
    darker: string;
  };

  // Accent Colors (Amarelo - Huron Recovery)
  accent: {
    light: string;
    main: string;
    dark: string;
    lighter: string;
    darker: string;
  };

  // Additional Profile Colors
  profiles: {
    huronAreia: string;
    huronPersonal: string;
    huronRecovery: string;
    htri: string;
    avitta: string;
  };

  // Semantic Colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // Neutral Colors
  neutral: {
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderLight: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
  };

  // Shadows
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // Gradients
  gradient: {
    primary: string;
    secondary: string;
    accent: string;
    subtle: string;
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// Light Theme
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: {
      lighter: '#e0f5ec',
      light: '#b3e5db',
      main: '#22c55e',
      dark: '#16a34a',
      darker: '#15803d',
    },
    secondary: {
      lighter: '#e0e9f8',
      light: '#bfd7f4',
      main: '#3b82f6',
      dark: '#2563eb',
      darker: '#1e40af',
    },
    accent: {
      lighter: '#fef9e7',
      light: '#fef3c7',
      main: '#eab308',
      dark: '#ca8a04',
      darker: '#a16207',
    },
    profiles: {
      huronAreia: '#22c55e',
      huronPersonal: '#3b82f6',
      huronRecovery: '#eab308',
      htri: '#92400e',
      avitta: '#8b5cf6',
    },
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    neutral: {
      background: '#ffffff',
      surface: '#f9fafb',
      surfaceHover: '#f3f4f6',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
        inverse: '#ffffff',
      },
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      secondary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      accent: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      subtle: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    },
  },
};

// Dark Theme
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: {
      lighter: '#d0f4e6',
      light: '#86efac',
      main: '#22c55e',
      dark: '#16a34a',
      darker: '#06b6d4',
    },
    secondary: {
      lighter: '#dbeafe',
      light: '#93c5fd',
      main: '#3b82f6',
      dark: '#2563eb',
      darker: '#60a5fa',
    },
    accent: {
      lighter: '#fef08a',
      light: '#fde047',
      main: '#eab308',
      dark: '#ca8a04',
      darker: '#facc15',
    },
    profiles: {
      huronAreia: '#22c55e',
      huronPersonal: '#3b82f6',
      huronRecovery: '#eab308',
      htri: '#92400e',
      avitta: '#c084fc',
    },
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    neutral: {
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      border: '#334155',
      borderLight: '#475569',
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        inverse: '#0f172a',
      },
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      secondary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      accent: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      subtle: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    },
  },
};

// Theme selector function
export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

// Default theme
export const DEFAULT_THEME: ThemeMode = 'light';
