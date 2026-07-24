export const fontFamilies = {
  primary: 'Inter-Regular',
  secondary: 'Poppins-Regular',
  tertiary: 'Roboto',
} as const;

type WeightKey = '400' | '500' | '600' | '700' | '800';

export const fontFamilyByWeight: Record<'Inter' | 'Poppins', Record<WeightKey, string>> = {
  Inter: {
    '400': 'Inter-Regular',
    '500': 'Inter-Medium',
    '600': 'Inter-SemiBold',
    '700': 'Inter-Bold',
    '800': 'Inter-ExtraBold',
  },
  Poppins: {
    '400': 'Poppins-Regular',
    '500': 'Poppins-Medium',
    '600': 'Poppins-SemiBold',
    '700': 'Poppins-Bold',
    '800': 'Poppins-Bold',
  },
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const lineHeights = {
  xs: 14,
  sm: 16,
  base: 20,
  md: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 38,
  '4xl': 44,
  '5xl': 56,
} as const;

export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
} as const;

const getFontFamily = (family: 'Inter' | 'Poppins', weight: string) => {
  return fontFamilyByWeight[family][weight as WeightKey] || fontFamilyByWeight[family]['400'];
};

export const typography = {
  display: {
    fontFamily: getFontFamily('Poppins', fontWeights.bold),
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights['5xl'],
    letterSpacing: letterSpacing.tight,
  },
  headline1: {
    fontFamily: getFontFamily('Poppins', fontWeights.bold),
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights['3xl'],
    letterSpacing: letterSpacing.tight,
  },
  headline2: {
    fontFamily: getFontFamily('Poppins', fontWeights.bold),
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights['2xl'],
    letterSpacing: letterSpacing.tight,
  },
  title1: {
    fontFamily: getFontFamily('Inter', fontWeights.semibold),
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.xl,
    letterSpacing: letterSpacing.normal,
  },
  title2: {
    fontFamily: getFontFamily('Inter', fontWeights.semibold),
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.lg,
    letterSpacing: letterSpacing.normal,
  },
  title3: {
    fontFamily: getFontFamily('Inter', fontWeights.semibold),
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.md,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: getFontFamily('Inter', fontWeights.regular),
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.base,
    letterSpacing: letterSpacing.normal,
  },
  bodyMedium: {
    fontFamily: getFontFamily('Inter', fontWeights.medium),
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.base,
    letterSpacing: letterSpacing.normal,
  },
  caption: {
    fontFamily: getFontFamily('Inter', fontWeights.regular),
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
    letterSpacing: letterSpacing.normal,
  },
  captionMedium: {
    fontFamily: getFontFamily('Inter', fontWeights.medium),
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.sm,
    letterSpacing: letterSpacing.normal,
  },
  button: {
    fontFamily: getFontFamily('Inter', fontWeights.semibold),
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.base,
    letterSpacing: letterSpacing.wide,
  },
  label: {
    fontFamily: getFontFamily('Inter', fontWeights.medium),
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.xs,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
