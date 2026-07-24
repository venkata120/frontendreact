import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Input, StepIndicator } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { usersService } from '../../src/api/services';
import { useState } from 'react';
import { regex, messages, normalizeMobile, sanitizeMobile, getApiErrorMessage } from '../../src/utils/validation';

const schema = z.object({
  fullName: z
    .string()
    .min(1, messages.required('Full Name'))
    .regex(regex.alphabetsOnly, messages.alphabetsOnly('Full Name')),
  email: z
    .string()
    .min(1, messages.required('Email'))
    .regex(regex.email, messages.validEmail('Email')),
  mobile: z
    .string()
    .min(1, messages.required('Mobile Number'))
    .regex(regex.mobile, messages.validMobile('Mobile Number')),
  password: z
    .string()
    .min(1, messages.required('Password'))
    .regex(regex.strongPassword, messages.strongPassword()),
  confirmPassword: z
    .string()
    .min(1, messages.required('Confirm Password')),
  aadhaar: z
    .string()
    .min(1, messages.required('Aadhaar Number'))
    .regex(regex.aadhaar, messages.validAadhaar()),
}).refine((data) => data.password === data.confirmPassword, {
  message: messages.passwordMatch(),
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { icon: 'person' as const },
  { icon: 'business' as const },
  { icon: 'checkmark' as const },
];

export default function SignupOwnerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, selectRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
      aadhaar: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const mobile = normalizeMobile(data.mobile);
      await usersService.create({
        name: data.fullName,
        email: data.email,
        password: data.password,
        mobile,
        role: 'OWNER' as any,
        active: true,
      });
      selectRole('owner');
      await login(data.email, data.password, 'owner');
      router.push('/(auth)/installation-of-property');
    } catch (err: any) {
      const message = getApiErrorMessage(err, 'Signup failed');
      setError(message);
      const fullUrl = `${err?.config?.baseURL || ''}${err?.config?.url || ''}`;
      console.log('Signup error:', err?.response?.status, message, fullUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor="#8FA3B8">
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: theme.spacing.base,
            paddingTop: theme.spacing.lg,
            backgroundColor: '#8FA3B8',
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <StepIndicator steps={STEPS} currentStep={0} style={{ marginBottom: theme.spacing.lg, marginTop: theme.spacing.sm }} />

          <View style={{ marginBottom: theme.spacing.md }}>
            <Typography variant="headline2" color={theme.colors.white} align="center">
              Let&apos;s set up your profile
            </Typography>
            <Typography variant="body" color="rgba(255,255,255,0.8)" align="center" style={{ marginTop: theme.spacing.sm }}>
              Please provide basic details
            </Typography>
          </View>

          <Typography variant="title1" color={theme.colors.white} align="center" style={{ marginBottom: theme.spacing.lg }}>
            Signup as OWNER
          </Typography>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.base,
            paddingBottom: theme.spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Input
                  label="Full Name *"
                  placeholder="Enter full name"
                  maxLength={50}
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.fullName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  label="Email *"
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="mobile"
              render={({ field }) => (
                <Input
                  label="Mobile Number *"
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={field.value}
                  onChangeText={(text) => field.onChange(sanitizeMobile(text))}
                  error={errors.mobile?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Input
                  label="Password *"
                  placeholder="Enter password"
                  secureTextEntry
                  enableVisibilityToggle
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <Input
                  label="Confirm Password *"
                  placeholder="Confirm password"
                  secureTextEntry
                  enableVisibilityToggle
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="aadhaar"
              render={({ field }) => (
                <Input
                  label="Aadhaar Number *"
                  placeholder="Enter Aadhaar number"
                  keyboardType="numeric"
                  maxLength={12}
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.aadhaar?.message}
                />
              )}
            />

            {error && (
              <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                {error}
              </Typography>
            )}
          </View>

          <View style={{ paddingTop: theme.spacing.md }}>
            <Button title="Next" loading={loading} onPress={handleSubmit(onSubmit)} />
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
}
