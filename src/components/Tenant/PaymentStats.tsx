import React from 'react';
import { View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  total: number;
  partial: number;
  pending: number;
}

export const PaymentStats: React.FC<Props> = ({ total, partial, pending }) => {
  const theme = useTheme();
  const items = [
    { label: 'Total amount', value: `₹${total.toLocaleString()}`, color: theme.colors.text },
    { label: 'Partial', value: `₹${partial.toLocaleString()}`, color: theme.colors.success },
    { label: 'Pending', value: `₹${pending.toLocaleString()}`, color: theme.colors.warning },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: theme.radius.md,
        overflow: 'hidden',
      }}
    >
      {items.map((item, index) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            paddingVertical: theme.spacing.sm,
            alignItems: 'center',
            borderRightWidth: index < items.length - 1 ? 1 : 0,
            borderRightColor: theme.colors.borderLight,
          }}
        >
          <Typography variant="caption" color={theme.colors.textMuted}>
            {item.label}
          </Typography>
          <Typography variant="bodyMedium" color={item.color} style={{ fontWeight: '600' }}>
            {item.value}
          </Typography>
        </View>
      ))}
    </View>
  );
};
