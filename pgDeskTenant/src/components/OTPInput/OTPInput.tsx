import React, { useRef, useState } from 'react';
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const OTPInput: React.FC<Props> = ({ length = 6, value, onChange, disabled = false }) => {
  const theme = useTheme();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef<Array<TextInput | null>>([]);

  const values = value.split('').slice(0, length);
  while (values.length < length) values.push('');

  const handleChange = (text: string, index: number) => {
    const digits = text.replace(/\D/g, '');
    const newValues = [...values];
    newValues[index] = digits.slice(-1);
    const newValue = newValues.join('');
    onChange(newValue);

    if (digits && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {values.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => setFocusedIndex(index)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
          style={{
            width: 56,
            height: 56,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            borderColor: focusedIndex === index ? theme.colors.primary : theme.colors.borderLight,
            backgroundColor: theme.colors.background,
            textAlign: 'center',
            textAlignVertical: 'center',
            fontFamily: theme.fontFamilies.secondary,
            fontSize: theme.fontSizes['2xl'],
            color: theme.colors.text,
          }}
        />
      ))}
    </View>
  );
};
