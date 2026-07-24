import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Option<T> {
  label: string;
  value: T;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface Props<T> {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

export function FilterSheet<T extends string>({ visible, onClose, title, options, selected, onSelect }: Props<T>) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Typography variant="title2" style={{ fontWeight: '600' }}>
              {title}
            </Typography>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          {options.map((option) => {
            const isSelected = selected === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {option.icon && (
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={isSelected ? theme.colors.primary : theme.colors.textTertiary}
                      style={{ marginRight: theme.spacing.sm }}
                    />
                  )}
                  <Typography variant="bodyMedium" color={isSelected ? theme.colors.primary : theme.colors.text}>
                    {option.label}
                  </Typography>
                </View>
                {isSelected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
