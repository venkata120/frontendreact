import React from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<Props> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  placeholderTextColor,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <View style={[{ marginBottom: theme.spacing.base }, containerStyle]}>
      {label && (
        <Typography
          variant="bodyMedium"
          color={theme.colors.text}
          style={{ marginBottom: theme.spacing.sm }}
        >
          {label}
        </Typography>
      )}
      <View
        style={{
          height: 52,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.borderLight,
        }}
      >
        {leftIcon && <View style={{ marginRight: theme.spacing.sm }}>{leftIcon}</View>}
        <TextInput
          style={[
            {
              flex: 1,
              fontFamily: theme.fontFamilies.primary,
              fontSize: theme.fontSizes.base,
              color: theme.colors.text,
              paddingVertical: 0,
            },
            inputStyle,
          ]}
          placeholderTextColor={placeholderTextColor ?? theme.colors.placeholder}
          {...rest}
        />
        {rightIcon && <View style={{ marginLeft: theme.spacing.sm }}>{rightIcon}</View>}
      </View>
      {error && (
        <Typography
          variant="caption"
          color={theme.colors.danger}
          style={{ marginTop: theme.spacing.xs }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};
