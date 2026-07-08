import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  valueColor?: string;
  isLast?: boolean;
}

export const InfoRow: React.FC<Props> = ({ icon, label, value = '-', valueColor, isLast }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.borderLight,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.spacing.sm }}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} style={{ marginRight: theme.spacing.sm }} />
        <Typography variant="body" color={theme.colors.textTertiary}>
          {label}
        </Typography>
      </View>
      <Typography variant="bodyMedium" color={valueColor ?? theme.colors.text} style={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </View>
  );
};
