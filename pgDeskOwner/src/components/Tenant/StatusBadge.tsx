import React from 'react';
import { View } from 'react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';
import type { TenantStatus } from '../../types';

interface Props {
  status: TenantStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const theme = useTheme();
  const isActive = status === 'ACTIVE';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: isActive ? theme.colors.successSurface : theme.colors.dangerSurface,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: isActive ? theme.colors.success : theme.colors.danger,
          marginRight: 4,
        }}
      />
      <Typography variant="captionMedium" color={isActive ? theme.colors.success : theme.colors.danger}>
        {isActive ? 'Active' : 'Left'}
      </Typography>
    </View>
  );
};
