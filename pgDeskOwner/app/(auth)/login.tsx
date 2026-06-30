import { useRouter } from 'expo-router';
import { View, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenWrapper, Typography, Button, Input, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { getRoleBasedRoute } from '../../src/utils/roleRouting';
import { useEffect } from 'react';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, loading, error, resetError, isAuthenticated, userRole } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    resetError();
    try {
      await login(data.email, data.password);
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
    <ScreenWrapper avoidKeyboard>
      <Header onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing['3xl'] }}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
          </View>

          <Typography variant="headline2" align="center">
            Welcome Back !
          </Typography>
          <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing['3xl'] }}>
            Login to manage your property
          </Typography>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                leftIcon="mail-outline"
                containerStyle={{ marginBottom: theme.spacing.md }}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Enter your password"
                secureTextEntry
                enableVisibilityToggle
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                leftIcon="lock-closed-outline"
              />
            )}
          />

          {error && (
            <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
              {error}
            </Typography>
          )}

          <Button
            title="Login"
            loading={loading}
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
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
