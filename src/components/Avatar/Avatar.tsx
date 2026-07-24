import React from 'react';
import { View, Image, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
};

const contrastColor = (bg: string) => {
  const { r, g, b } = hexToRgb(bg);
  // Relative luminance approximation
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111827' : '#FFFFFF';
};

export const Avatar: React.FC<Props> = ({ uri, name, size = 48, style }) => {
  const theme = useTheme();
  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  const bg = (style?.backgroundColor as string) || theme.colors.primary;
  const fg = contrastColor(bg);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.primary,
          borderWidth: 2,
          borderColor: theme.colors.white,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.sm,
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : initials ? (
        <Typography variant="bodyMedium" color={fg}>
          {initials}
        </Typography>
      ) : (
        <Ionicons name="person-outline" size={size * 0.45} color={fg} />
      )}
    </View>
  );
};
