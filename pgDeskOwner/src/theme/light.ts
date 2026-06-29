import { lightColors } from './colors';
import { spacing } from './spacing';
import { typography, fontFamilies, fontWeights, fontSizes, lineHeights, letterSpacing } from './typography';
import { radius } from './radius';
import { createShadows } from './shadows';
import { animations, transitionPresets } from './animations';
import type { Theme } from './theme-types';

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  typography,
  fontFamilies,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  radius,
  shadows: createShadows(lightColors),
  animations,
  transitionPresets,
  isDark: false,
};
