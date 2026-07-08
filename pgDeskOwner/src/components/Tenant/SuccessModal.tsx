import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { Button } from '../Button/Button';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  visible: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  title: string;
  message?: string;
  primaryButton?: { title: string; onPress: () => void };
  secondaryButton?: { title: string; onPress: () => void };
  onClose?: () => void;
}

export const SuccessModal: React.FC<Props> = ({
  visible,
  icon = 'checkmark-circle',
  iconColor,
  iconBg,
  title,
  message,
  primaryButton,
  secondaryButton,
  onClose,
}) => {
  const theme = useTheme();
  const ic = iconColor ?? theme.colors.success;
  const bg = iconBg ?? theme.colors.successSurface;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay, padding: theme.spacing.lg }}>
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: theme.radius['2xl'],
            padding: theme.spacing.xl,
            width: '100%',
            alignItems: 'center',
          }}
        >
          {onClose && (
            <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: theme.spacing.md, right: theme.spacing.md }}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: bg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons name={icon} size={32} color={ic} />
          </View>
          <Typography variant="title1" style={{ marginBottom: theme.spacing.sm, textAlign: 'center' }}>
            {title}
          </Typography>
          {message && (
            <Typography variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
              {message}
            </Typography>
          )}
          {primaryButton && (
            <Button title={primaryButton.title} onPress={primaryButton.onPress} style={{ marginBottom: theme.spacing.sm }} />
          )}
          {secondaryButton && <Button title={secondaryButton.title} variant="outline" onPress={secondaryButton.onPress} />}
        </View>
      </View>
    </Modal>
  );
};
