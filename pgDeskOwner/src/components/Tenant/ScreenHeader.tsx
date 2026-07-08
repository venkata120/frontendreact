import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenHeader: React.FC<Props> = ({
  title,
  subtitle,
  backgroundColor,
  textColor,
  onBack,
  rightAction,
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bg = backgroundColor ?? theme.colors.primary;
  const fg = textColor ?? theme.colors.white;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {onBack && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onBack}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: theme.colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing.md,
              }}
            >
              <Ionicons name="arrow-back" size={20} color={bg} />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Typography variant="headline2" color={fg} numberOfLines={1}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color={fg} style={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </View>
        </View>
        {rightAction && <View style={{ marginLeft: theme.spacing.sm }}>{rightAction}</View>}
      </View>
    </View>
  );
};
