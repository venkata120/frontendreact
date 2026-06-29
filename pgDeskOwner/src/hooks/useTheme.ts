import { useContext } from 'react';
import { ThemeContext } from '../components/providers/ThemeProvider';
import { lightTheme } from '../theme';
import type { Theme } from '../theme';

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return lightTheme;
  }
  return ctx.current;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { mode: 'light' as const, setMode: (_: 'light' | 'dark' | 'system') => {}, toggle: () => {} };
  }
  return {
    mode: ctx.theme,
    setMode: ctx.setTheme,
    toggle: ctx.toggle,
  };
};
