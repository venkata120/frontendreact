import React, { useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from '../Typography/Typography';
import { Button } from '../Button/Button';
import { useTheme } from '../../hooks/useTheme';

interface DatePickerProps {
  visible: boolean;
  value?: Date | string;
  onChange: (date: Date) => void;
  onClose: () => void;
  title?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePicker({
  visible,
  value,
  onChange,
  onClose,
  title = 'Select Date',
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const theme = useTheme();
  const initial = value ? new Date(value) : new Date();
  const [selected, setSelected] = useState(initial);

  useEffect(() => {
    if (visible) {
      setSelected(value ? new Date(value) : new Date());
    }
  }, [visible, value]);

  const handleChange = (_event: any, date?: Date) => {
    if (date) {
      setSelected(date);
      if (Platform.OS === 'android') {
        onChange(date);
        onClose();
      }
    }
  };

  const handleConfirm = () => {
    onChange(selected);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={20} color={theme.colors.white} />
              <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: theme.spacing.sm, fontWeight: '600' }}>
                {title}
              </Typography>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingVertical: theme.spacing.md, alignItems: 'center' }}>
            <RNDateTimePicker
              value={selected}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={handleChange}
            />
          </View>

          <View style={{ flexDirection: 'row', padding: theme.spacing.base, paddingBottom: theme.spacing.xl }}>
            <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: theme.spacing.sm }} />
            <Button title="Confirm" onPress={handleConfirm} style={{ flex: 1, marginLeft: theme.spacing.sm }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
