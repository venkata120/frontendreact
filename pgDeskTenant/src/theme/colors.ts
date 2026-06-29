export const palette = {
  primary: {
    50: '#EDF8FF',
    100: '#D6EEFF',
    200: '#A6D4FF',
    300: '#6EB6FF',
    400: '#3996FF',
    500: '#0065F4',
    600: '#0851C5',
    700: '#0D479B',
    800: '#0A3574',
    900: '#07244E',
  },
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#EAD0FF',
    300: '#D6A8FF',
    400: '#BC72FF',
    500: '#9200FF',
    600: '#7A00D6',
    700: '#59168B',
    800: '#45106B',
    900: '#2E0A47',
  },
  purple: {
    400: '#7C6BFF',
    500: '#4F39F6',
    600: '#3D2BC4',
    700: '#2E218F',
  },
  success: {
    50: '#E8F9EE',
    100: '#CFF0DA',
    200: '#A3E2B8',
    500: '#00A63E',
    600: '#009437',
    700: '#007A2D',
  },
  warning: {
    50: '#FFF4E6',
    100: '#FFE6CC',
    200: '#FFCD99',
    500: '#E27305',
    600: '#C26104',
    700: '#9B4E03',
  },
  danger: {
    50: '#FDEDED',
    100: '#F9CACA',
    200: '#F5A6A6',
    500: '#82181A',
    600: '#6B1315',
    700: '#540F10',
  },
  gray: {
    0: '#FFFFFF',
    50: '#F6F6F6',
    100: '#F0F0F0',
    200: '#E7E7E7',
    300: '#D9D9D9',
    400: '#B0B0B0',
    500: '#888888',
    600: '#6D6D6D',
    700: '#5D5D5D',
    800: '#3D3D3D',
    900: '#252525',
    950: '#1A1A1A',
  },
} as const;

export interface Colors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySurface: string;
  secondary: string;
  accentPurple: string;
  success: string;
  successSurface: string;
  warning: string;
  warningSurface: string;
  danger: string;
  dangerSurface: string;
  info: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  card: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  placeholder: string;
  disabled: string;
  overlay: string;
  white: string;
  black: string;
}

export const lightColors: Colors = {
  primary: palette.primary[500],
  primaryDark: palette.primary[600],
  primaryLight: palette.primary[100],
  primarySurface: palette.primary[50],
  secondary: palette.purple[500],
  accentPurple: palette.secondary[500],
  success: palette.success[500],
  successSurface: palette.success[50],
  warning: palette.warning[500],
  warningSurface: palette.warning[50],
  danger: palette.danger[500],
  dangerSurface: palette.danger[50],
  info: palette.primary[500],
  background: palette.gray[0],
  backgroundSecondary: palette.gray[50],
  surface: palette.gray[0],
  card: palette.gray[0],
  border: palette.gray[200],
  borderLight: palette.gray[300],
  text: palette.gray[900],
  textSecondary: palette.gray[800],
  textTertiary: palette.gray[600],
  textMuted: palette.gray[500],
  placeholder: palette.gray[400],
  disabled: palette.gray[300],
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
};

export const darkColors: Colors = {
  primary: palette.primary[400],
  primaryDark: palette.primary[500],
  primaryLight: palette.primary[800],
  primarySurface: palette.primary[900],
  secondary: palette.purple[400],
  accentPurple: palette.secondary[400],
  success: palette.success[500],
  successSurface: '#0F2B18',
  warning: palette.warning[500],
  warningSurface: '#3B2206',
  danger: palette.danger[500],
  dangerSurface: '#2C0B0B',
  info: palette.primary[400],
  background: palette.gray[950],
  backgroundSecondary: '#121212',
  surface: '#1E1E1E',
  card: '#1E1E1E',
  border: palette.gray[700],
  borderLight: palette.gray[800],
  text: palette.gray[0],
  textSecondary: palette.gray[100],
  textTertiary: palette.gray[400],
  textMuted: palette.gray[500],
  placeholder: palette.gray[600],
  disabled: palette.gray[700],
  overlay: 'rgba(0, 0, 0, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
};
