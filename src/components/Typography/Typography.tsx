import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { TypographyVariant } from '../../theme';

interface Props extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
  size?: number;
  lineHeight?: number;
  children: React.ReactNode;
}

export const Typography: React.FC<Props> = ({
  variant = 'body',
  color,
  align,
  weight,
  size,
  lineHeight,
  style,
  children,
  ...rest
}) => {
  const theme = useTheme();
  const variantStyle = theme.typography[variant];

  return (
    <RNText
      style={[
        {
          fontFamily: variantStyle.fontFamily,
          fontSize: size ?? variantStyle.fontSize,
          fontWeight: weight ?? (variantStyle.fontWeight as TextStyle['fontWeight']),
          lineHeight: lineHeight ?? variantStyle.lineHeight,
          letterSpacing: variantStyle.letterSpacing,
          color: color ?? theme.colors.text,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
