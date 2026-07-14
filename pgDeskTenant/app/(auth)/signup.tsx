import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Input, Header, DatePicker } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { tenantsService } from '../../src/api/services/tenants';
import {
  MOBILE_REGEX,
  NAME_REGEX,
  AADHAAR_REGEX,
  sanitizeMobile,
  sanitizeName,
  sanitizeAadhaar,
} from '../../src/utils/validation';

const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const schema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name is required')
    .max(50, 'Name is too long')
    .regex(NAME_REGEX, 'Full name must contain only alphabets and at least one letter'),
  mobile: z
    .string()
    .regex(MOBILE_REGEX, 'Enter a valid 10-digit mobile number starting with 6-9'),
  parentName: z
    .string()
    .min(2, 'Parent name is required')
    .max(50, 'Parent name is too long')
    .regex(NAME_REGEX, 'Parent name must contain only alphabets and at least one letter'),
  parentMobile: z
    .string()
    .regex(MOBILE_REGEX, 'Enter a valid 10-digit mobile number starting with 6-9'),
  dob: z
    .string()
    .regex(dobRegex, 'Select a valid date of birth'),
  aadhaar: z
    .string()
    .regex(AADHAAR_REGEX, 'Aadhaar number must be 12 digits'),
});

type FormData = z.infer<typeof schema>;

function formatDate(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day };
}

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      mobile: '',
      parentName: '',
      parentMobile: '',
      dob: '',
      aadhaar: '',
    },
  });

  const dobValue = watch('dob');

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await tenantsService.create({
        fullName: data.fullName,
        phone: data.mobile,
        emergencyContact: data.parentMobile,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        rentPerMonth: 0,
      } as any);
      Alert.alert('Account created', 'Please log in with your registered mobile number.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      Alert.alert('Signup failed', message);
    } finally {
      setLoading(false);
    }
  };

  const displayDob = dobValue
    ? (() => {
        const { year, month, day } = parseDate(dobValue);
        return `${String(day).padStart(2, '0')} ${months[month]} ${year}`;
      })()
    : '';

  return (
    <ScreenWrapper
      avoidKeyboard
      scrollable
      scrollProps={{
        showsVerticalScrollIndicator: false,
        contentContainerStyle: {
          flexGrow: 1,
          paddingHorizontal: theme.spacing.base,
          paddingBottom: theme.spacing['3xl'],
        },
      }}
    >
      <Header onBack={() => router.back()} />
      <View style={{ paddingTop: theme.spacing.lg }}>
        <Typography variant="headline2" align="center">
          Create Account
        </Typography>
        <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
          Register as a tenant
        </Typography>

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name *"
              placeholder="Enter full name"
              autoCapitalize="words"
              maxLength={50}
              value={value}
              onChangeText={(text) => onChange(sanitizeName(text))}
              onBlur={onBlur}
              error={errors.fullName?.message}
              leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
            />
          )}
        />

        <Controller
          control={control}
          name="mobile"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Mobile Number *"
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={value}
              onChangeText={(text) => onChange(sanitizeMobile(text))}
              onBlur={onBlur}
              error={errors.mobile?.message}
              leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />}
            />
          )}
        />

        <Controller
          control={control}
          name="parentName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Parent Name *"
              placeholder="Enter parent name"
              autoCapitalize="words"
              maxLength={50}
              value={value}
              onChangeText={(text) => onChange(sanitizeName(text))}
              onBlur={onBlur}
              error={errors.parentName?.message}
              leftIcon={<Ionicons name="people-outline" size={20} color={theme.colors.textMuted} />}
            />
          )}
        />

        <Controller
          control={control}
          name="parentMobile"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Parent Mobile Number *"
              placeholder="Enter parent mobile"
              keyboardType="phone-pad"
              maxLength={10}
              value={value}
              onChangeText={(text) => onChange(sanitizeMobile(text))}
              onBlur={onBlur}
              error={errors.parentMobile?.message}
              leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />}
            />
          )}
        />

        <Controller
          control={control}
          name="dob"
          render={({ field: { value } }) => (
            <View>
              <TouchableOpacity activeOpacity={0.9} onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <Input
                    label="Date of Birth *"
                    placeholder="Select date of birth"
                    value={displayDob}
                    editable={false}
                    error={errors.dob?.message}
                    leftIcon={<Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />}
                  />
                </View>
              </TouchableOpacity>
              <DatePicker
                visible={showDatePicker}
                value={value}
                onChange={(date) => setValue('dob', formatDate(date.getFullYear(), date.getMonth(), date.getDate()), { shouldValidate: true })}
                onClose={() => setShowDatePicker(false)}
                title="Select Date of Birth"
                maximumDate={new Date()}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="aadhaar"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Aadhaar Number *"
              placeholder="Enter 12-digit Aadhaar number"
              keyboardType="number-pad"
              maxLength={12}
              value={value}
              onChangeText={(text) => onChange(sanitizeAadhaar(text))}
              onBlur={onBlur}
              error={errors.aadhaar?.message}
              leftIcon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
            />
          )}
        />

        <Button
          title="Sign Up"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.lg }}
        />

        <Button
          title="Already have an account? Login"
          variant="ghost"
          onPress={() => router.replace('/(auth)/login')}
          style={{ marginTop: theme.spacing.sm }}
        />
      </View>
    </ScreenWrapper>
  );
}
