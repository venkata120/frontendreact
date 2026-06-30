import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode | string;
  rightIcon?: React.ReactNode | string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  enableVisibilityToggle?: boolean;
}

export const Input: React.FC<Props> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  placeholderTextColor,
  enableVisibilityToggle,
  secureTextEntry,
  ...rest
}) => {
  const theme = useTheme();
  const isMultiline = rest.multiline === true;
  const [visible, setVisible] = useState(false);
  const isPassword = enableVisibilityToggle && secureTextEntry;
  const effectiveSecureTextEntry = isPassword ? !visible : secureTextEntry;

  const renderIcon = (icon: React.ReactNode | string | undefined) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return (
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={theme.colors.placeholder}
        />
      );
    }
    return icon;
  };

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
          minHeight: 52,
          height: isMultiline ? undefined : 52,
          flexDirection: 'row',
          alignItems: isMultiline ? 'flex-start' : 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: isMultiline ? theme.spacing.md : 0,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.borderLight,
        }}
      >
        {leftIcon && (
          <View style={{ marginRight: theme.spacing.sm }}>
            {renderIcon(leftIcon)}
          </View>
        )}
        <TextInput
          style={[
            {
              flex: 1,
              fontFamily: theme.fontFamilies.primary,
              fontSize: theme.fontSizes.base,
              color: theme.colors.text,
              paddingVertical: 0,
              textAlignVertical: isMultiline ? 'top' : 'auto',
            },
            inputStyle,
          ]}
          placeholderTextColor={placeholderTextColor ?? theme.colors.placeholder}
          secureTextEntry={effectiveSecureTextEntry}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setVisible((v) => !v)}
            style={{ marginLeft: theme.spacing.sm, padding: 4 }}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.placeholder}
            />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <View style={{ marginLeft: theme.spacing.sm }}>
            {renderIcon(rightIcon)}
          </View>
        )}
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
