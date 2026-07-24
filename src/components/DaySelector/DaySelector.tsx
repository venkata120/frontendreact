import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

// Backend maps: 1=Sunday ... 7=Saturday
const DAYS = [
  { label: 'S', value: 1, name: 'Sun' },
  { label: 'M', value: 2, name: 'Mon' },
  { label: 'T', value: 3, name: 'Tue' },
  { label: 'W', value: 4, name: 'Wed' },
  { label: 'T', value: 5, name: 'Thu' },
  { label: 'F', value: 6, name: 'Fri' },
  { label: 'S', value: 7, name: 'Sat' },
];

const EVERYDAY = [1, 2, 3, 4, 5, 6, 7];
const WEEKDAYS = [2, 3, 4, 5, 6];
const WEEKENDS = [1, 7];

interface DaySelectorProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export function getRepeatLabel(days?: number[]): string {
  if (!days || days.length === 0) return '';
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return 'Everyday';
  if (JSON.stringify(sorted) === JSON.stringify(WEEKDAYS)) return 'Mon-Fri';
  if (JSON.stringify(sorted) === JSON.stringify(WEEKENDS)) return 'Weekends';
  return sorted.map((d) => DAYS.find((day) => day.value === d)?.name).filter(Boolean).join(', ');
}

export function DaySelector({ selectedDays, onChange }: DaySelectorProps) {
  const theme = useTheme();

  const toggleDay = (value: number) => {
    if (selectedDays.includes(value)) {
      onChange(selectedDays.filter((d) => d !== value));
    } else {
      onChange([...selectedDays, value].sort((a, b) => a - b));
    }
  };

  const setPreset = (days: number[]) => onChange(days);

  const isEveryday = selectedDays.length === 7;
  const isWeekdays = JSON.stringify(selectedDays.sort((a, b) => a - b)) === JSON.stringify(WEEKDAYS);
  const isWeekends = JSON.stringify(selectedDays.sort((a, b) => a - b)) === JSON.stringify(WEEKENDS);

  const presets = [
    { label: 'Everyday', days: EVERYDAY, active: isEveryday },
    { label: 'Weekdays', days: WEEKDAYS, active: isWeekdays },
    { label: 'Weekends', days: WEEKENDS, active: isWeekends },
  ];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        {DAYS.map((day) => {
          const active = selectedDays.includes(day.value);
          return (
            <TouchableOpacity
              key={day.value}
              activeOpacity={0.8}
              onPress={() => toggleDay(day.value)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? theme.colors.primary : theme.colors.backgroundSecondary,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
              }}
            >
              <Typography variant="caption" color={active ? theme.colors.white : theme.colors.text} style={{ fontWeight: '600' }}>
                {day.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {presets.map((preset) => (
          <TouchableOpacity
            key={preset.label}
            activeOpacity={0.8}
            onPress={() => setPreset(preset.days)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.full,
              backgroundColor: preset.active ? theme.colors.primary : theme.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: preset.active ? theme.colors.primary : theme.colors.border,
            }}
          >
            <Typography variant="caption" color={preset.active ? theme.colors.white : theme.colors.text}>
              {preset.label}
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
