import React, { useRef } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Typography } from '../Typography/Typography';
import { useTheme } from '../../hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  disableDebounce?: boolean;
}

export const Button: React.FC<Props> = ({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disableDebounce = false,
  style,
  onPress,
  ...rest
}) => {
  const theme = useTheme();
  const lastPressRef = useRef<number>(0);

  const handlePress = (e: any) => {
    if (!onPress) return;
    if (disableDebounce) {
      onPress(e);
      return;
    }
    const now = Date.now();
    if (now - lastPressRef.current < 500) return;
    lastPressRef.current = now;
    onPress(e);
  };

  const sizeStyles: Record<ButtonSize, { height: number; padding: number; fontSize: number }> = {
    sm: { height: 32, padding: theme.spacing.sm, fontSize: theme.fontSizes.sm },
    md: { height: 44, padding: theme.spacing.md, fontSize: theme.fontSizes.base },
    lg: { height: 52, padding: theme.spacing.base, fontSize: theme.fontSizes.base },
  };

  const s = sizeStyles[size];

  const baseContainer: ViewStyle = {
    height: s.height,
    paddingHorizontal: s.padding,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: disabled || loading ? 0.6 : 1,
  };

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: string }> = {
    primary: {
      container: { backgroundColor: theme.colors.primary },
      text: theme.colors.white,
    },
    secondary: {
      container: { backgroundColor: theme.colors.secondary },
      text: theme.colors.white,
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      text: theme.colors.text,
    },
    ghost: {
      container: { backgroundColor: 'transparent' },
      text: theme.colors.primary,
    },
    danger: {
      container: { backgroundColor: theme.colors.danger },
      text: theme.colors.white,
    },
  };

  const vs = variantStyles[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[baseContainer, vs.container, style]}
      onPress={handlePress}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {leftIcon}
          <Typography
            variant="button"
            color={vs.text}
            size={s.fontSize}
            style={{ marginHorizontal: leftIcon || rightIcon ? theme.spacing.sm : 0 }}
          >
            {title}
          </Typography>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};
