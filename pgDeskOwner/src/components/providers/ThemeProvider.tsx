import React, { createContext, useCallback, useState, useMemo } from 'react';
import { Theme, lightTheme } from '../../theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggle: () => void;
  current: Theme;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface Props {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  const setTheme = useCallback((mode: ThemeMode) => {
    // Theme is locked to light mode
    setThemeState('light');
  }, []);

  const resolvedTheme: 'light' | 'dark' = 'light';
  const current = lightTheme;

  const toggle = useCallback(() => {
    // Theme is locked to light mode
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle, current }),
    [theme, resolvedTheme, setTheme, toggle, current]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
