import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { Card } from '../Card/Card';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bg: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const TenantOverviewCard: React.FC<Props> = ({ label, value, icon, color, bg, onPress, style }) => {
  const theme = useTheme();

  const content = (
    <Card shadow="sm" padding={theme.spacing.md}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: theme.radius.base,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={{ marginLeft: theme.spacing.sm, flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color={theme.colors.textMuted} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Typography>
          <Typography
            variant="title2"
            color={color}
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ flexShrink: 1 }}
          >
            {value}
          </Typography>
        </View>
        {onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
            style={{ marginLeft: theme.spacing.xs }}
          />
        )}
      </View>
    </Card>
  );

  if (!onPress) {
    return <View style={style}>{content}</View>;
  }

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={style}>
      {content}
    </TouchableOpacity>
  );
};
