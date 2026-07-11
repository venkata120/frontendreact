import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export const Header: React.FC<Props> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  backgroundColor,
  textColor,
  style,
}) => {
  const theme = useTheme();
  const bg = backgroundColor ?? theme.colors.background;
  const fg = textColor ?? theme.colors.text;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.base,
          paddingVertical: theme.spacing.md,
          backgroundColor: bg,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: theme.spacing.sm }}>
            <Ionicons name="arrow-back" size={24} color={fg} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          {title && (
            <Typography variant="title1" color={fg} numberOfLines={1}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color={theme.colors.textMuted}>
              {subtitle}
            </Typography>
          )}
        </View>
      </View>
      {rightAction && (
        <View style={{ marginLeft: theme.spacing.sm, minWidth: 44, alignItems: 'flex-end' }}>
          {rightAction}
        </View>
      )}
    </View>
  );
};
