import React from 'react';
import { View, ViewProps, ScrollView, ScrollViewProps, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface Props extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  scrollProps?: ScrollViewProps;
  avoidKeyboard?: boolean;
  backgroundColor?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const ScreenWrapper: React.FC<Props> = ({
  children,
  scrollable = false,
  scrollProps,
  avoidKeyboard = false,
  backgroundColor,
  style,
  ...rest
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bg = backgroundColor ?? theme.colors.background;

  const containerStyle = [
    {
      flex: 1,
      backgroundColor: bg,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    style,
  ];

  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const wrapper = (
    <View style={containerStyle} {...rest}>
      {content}
    </View>
  );

  if (avoidKeyboard && Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        {wrapper}
      </KeyboardAvoidingView>
    );
  }

  return wrapper;
};
