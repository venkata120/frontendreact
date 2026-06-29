import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export interface Step {
  icon: keyof typeof Ionicons.glyphMap;
  label?: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
  style?: ViewStyle;
}

export const StepIndicator: React.FC<Props> = ({ steps, currentStep, style }) => {
  const theme = useTheme();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, style]}>
      {steps.map((step, index) => {
        const isActive = index <= currentStep;
        const isLast = index === steps.length - 1;

        return (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: isActive ? theme.colors.primary : theme.colors.borderLight,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: isActive ? theme.colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: isActive ? 4 : 0,
              }}
            >
              <Ionicons name={step.icon} size={20} color={theme.colors.white} />
            </View>
            {!isLast && (
              <View
                style={{
                  width: 48,
                  height: 2,
                  backgroundColor: index < currentStep ? theme.colors.primary : theme.colors.borderLight,
                  marginHorizontal: theme.spacing.sm,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};
