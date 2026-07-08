import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { Avatar } from '../Avatar/Avatar';
import { useTheme } from '../../hooks/useTheme';
import type { Tenant } from '../../types';

type Variant = 'default' | 'left' | 'active';

interface Props {
  tenant: Tenant & { roomNumber?: string; bedNumber?: string };
  variant?: Variant;
  onPress?: () => void;
  rightNode?: React.ReactNode;
}

export const TenantListItem: React.FC<Props> = ({ tenant, variant = 'default', onPress, rightNode }) => {
  const theme = useTheme();
  const isLeft = variant === 'left';
  const nameColor = isLeft ? theme.colors.textTertiary : theme.colors.text;
  const rentColor = isLeft ? theme.colors.textMuted : theme.colors.accentPurple;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
      }}
    >
      <Avatar uri={tenant.avatar} name={tenant.fullName} size={56} style={{ opacity: isLeft ? 0.6 : 1 }} />
      <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
        <Typography variant="title3" color={nameColor}>
          {tenant.fullName}
        </Typography>
        <View
          style={{
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.secondary + '1A',
            borderRadius: theme.radius.full,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: 2,
            marginTop: 4,
            marginBottom: 2,
          }}
        >
          <Typography variant="caption" color={theme.colors.accentPurple}>
            Room {tenant.roomNumber || tenant.bedNumber || '-'}
          </Typography>
        </View>
        <Typography variant="bodyMedium" color={rentColor}>
          ₹{tenant.rentPerMonth.toLocaleString()}/month
        </Typography>
      </View>
      {rightNode || (onPress && <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />)}
    </TouchableOpacity>
  );
};
