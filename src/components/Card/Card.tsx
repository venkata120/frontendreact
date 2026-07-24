import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props extends ViewProps {
  children: React.ReactNode;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: number;
  padding?: number;
  minHeight?: number;
}

export const Card: React.FC<Props> = ({
  children,
  shadow = 'md',
  borderRadius,
  padding,
  minHeight,
  style,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: borderRadius ?? theme.radius.lg,
          padding: padding ?? theme.spacing.base,
          minHeight,
          ...theme.shadows[shadow],
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};
