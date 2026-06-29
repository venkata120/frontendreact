import { Colors } from './colors';
import { spacing } from './spacing';
import { typography, fontFamilies, fontWeights, fontSizes, lineHeights, letterSpacing } from './typography';
import { radius } from './radius';
import { createShadows } from './shadows';
import { animations, transitionPresets } from './animations';

export interface Theme {
  colors: Colors;
  spacing: typeof spacing;
  typography: typeof typography;
  fontFamilies: typeof fontFamilies;
  fontWeights: typeof fontWeights;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  letterSpacing: typeof letterSpacing;
  radius: typeof radius;
  shadows: ReturnType<typeof createShadows>;
  animations: typeof animations;
  transitionPresets: typeof transitionPresets;
  isDark: boolean;
}
