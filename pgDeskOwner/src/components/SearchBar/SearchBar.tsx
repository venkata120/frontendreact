import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface Props extends TextInputProps {
  onFilter?: () => void;
}

export const SearchBar: React.FC<Props> = ({ onFilter, ...rest }) => {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.md,
        marginHorizontal: theme.spacing.base,
        marginVertical: theme.spacing.base,
        ...theme.shadows.md,
      }}
    >
      <Ionicons name="search" size={20} color={theme.colors.textMuted} />
      <TextInput
        style={{
          flex: 1,
          marginLeft: theme.spacing.sm,
          fontFamily: theme.fontFamilies.primary,
          fontSize: theme.fontSizes.base,
          color: theme.colors.text,
        }}
        placeholderTextColor={theme.colors.placeholder}
        {...rest}
      />
      {onFilter && (
        <Ionicons
          name="options-outline"
          size={22}
          color={theme.colors.primary}
          onPress={onFilter}
        />
      )}
    </View>
  );
};
