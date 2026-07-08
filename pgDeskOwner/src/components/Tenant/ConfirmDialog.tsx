import React from 'react';
import { View, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { Button } from '../Button/Button';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<Props> = ({
  visible,
  icon = 'trash-outline',
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const theme = useTheme();
  const iconColor = variant === 'danger' ? theme.colors.danger : theme.colors.primary;
  const iconBg = variant === 'danger' ? theme.colors.dangerSurface : theme.colors.primarySurface;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay, padding: theme.spacing.lg }}>
        <View style={{ backgroundColor: theme.colors.background, borderRadius: theme.radius['2xl'], padding: theme.spacing.xl, width: '100%', alignItems: 'center' }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons name={icon} size={32} color={iconColor} />
          </View>
          <Typography variant="title1" style={{ marginBottom: theme.spacing.sm, textAlign: 'center' }}>
            {title}
          </Typography>
          {message && (
            <Typography variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
              {message}
            </Typography>
          )}
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <Button title={cancelText} variant="outline" onPress={onCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <Button title={confirmText} variant={variant === 'danger' ? 'danger' : 'primary'} onPress={onConfirm} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
