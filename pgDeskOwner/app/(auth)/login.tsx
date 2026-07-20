import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Image, TouchableOpacity, KeyboardAvoidingView, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenWrapper, Typography, Button, Input, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { getRoleBasedRoute } from '../../src/utils/roleRouting';

const schema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { sendOtp, otpLoading, error, resetError, isAuthenticated, userRole, resetLoading } = useAuth();

  useEffect(() => {
    resetLoading();
  }, [resetLoading]);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mobile: '' },
  });

  const onSubmit = async (data: FormData) => {
    resetError();
    try {
      await sendOtp(data.mobile);
      router.push({ pathname: '/(auth)/otp', params: { mobile: data.mobile } });
    } catch {
      // handled by redux
    }
  };

  useEffect(() => {
    if (isAuthenticated && userRole) {
      router.replace(getRoleBasedRoute(userRole));
    }
  }, [isAuthenticated, userRole, router]);

  return (
    <ScreenWrapper>
      <Header onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
        >
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <Image
              source={require('../../assets/images/owner-login-illustration.png')}
              style={{ width: '100%', height: height * 0.45 }}
              resizeMode="contain"
            />
          </View>

          <Typography variant="headline2" align="center">
            Welcome Back!
          </Typography>
          <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing['3xl'] }}>
            Enter your Mobile Number. We will send you OTP to verify
          </Typography>

          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.mobile?.message}
                leftIcon={(
                  <Typography variant="bodyMedium" color={theme.colors.text}>
                    +91
                  </Typography>
                )}
                containerStyle={{ marginBottom: theme.spacing.md }}
              />
            )}
          />

          {error && (
            <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
              {error}
            </Typography>
          )}

          <Button
            title="Send OTP"
            loading={otpLoading}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: theme.spacing.lg }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl }}>
            <Typography variant="body" color={theme.colors.textMuted}>
              Don&apos;t have an account?{' '}
            </Typography>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup-owner')}>
              <Typography variant="bodyMedium" color={theme.colors.primary}>
                Sign Up
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
