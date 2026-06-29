import React from 'react';
import { View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

interface Props {
  label: string;
  variant?: BadgeVariant;
}

export const Badge: React.FC<Props> = ({ label, variant = 'primary' }) => {
  const theme = useTheme();

  const variants: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: theme.colors.primarySurface, text: theme.colors.primary },
    success: { bg: theme.colors.successSurface, text: theme.colors.success },
    warning: { bg: theme.colors.warningSurface, text: theme.colors.warning },
    danger: { bg: theme.colors.dangerSurface, text: theme.colors.danger },
    secondary: { bg: theme.colors.backgroundSecondary, text: theme.colors.textSecondary },
  };

  const v = variants[variant];

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.radius.full,
        backgroundColor: v.bg,
      }}
    >
      <Typography variant="captionMedium" color={v.text}>
        {label}
      </Typography>
    </View>
  );
};
