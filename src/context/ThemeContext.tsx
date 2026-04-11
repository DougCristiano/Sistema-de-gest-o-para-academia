import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, getTheme, Theme, DEFAULT_THEME } from '../theme/theme';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Get saved theme from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode');
      return (saved as ThemeMode) || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });

  const theme = getTheme(mode);

  // Update localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);

    // Update document class and CSS variables
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);

    // Apply theme colors as CSS variables for easier access
    const colors = theme.colors;
    root.style.setProperty('--color-primary-main', colors.primary.main);
    root.style.setProperty('--color-primary-light', colors.primary.light);
    root.style.setProperty('--color-primary-dark', colors.primary.dark);

    root.style.setProperty('--color-secondary-main', colors.secondary.main);
    root.style.setProperty('--color-secondary-light', colors.secondary.light);
    root.style.setProperty('--color-secondary-dark', colors.secondary.dark);

    root.style.setProperty('--color-accent-main', colors.accent.main);
    root.style.setProperty('--color-accent-light', colors.accent.light);
    root.style.setProperty('--color-accent-dark', colors.accent.dark);

    root.style.setProperty('--color-bg', colors.neutral.background);
    root.style.setProperty('--color-surface', colors.neutral.surface);
    root.style.setProperty('--color-border', colors.neutral.border);
    root.style.setProperty('--color-text', colors.neutral.text.primary);
    root.style.setProperty('--color-text-secondary', colors.neutral.text.secondary);
  }, [mode, theme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const value: ThemeContextType = {
    theme,
    mode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
