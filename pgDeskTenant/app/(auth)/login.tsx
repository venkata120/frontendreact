import { useRouter } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenWrapper, Typography, Button, Input, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';

const schema = z.object({
  phone: z.string().min(10, 'Enter a valid phone number'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { requestOTP, loading, error, resetError } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  });

  const onSubmit = async (data: FormData) => {
    resetError();
    try {
      await requestOTP(data.phone, 'tenant');
      router.push({ pathname: '/(auth)/otp', params: { phone: data.phone } });
    } catch (e) {
      // handled
    }
  };

  return (
    <ScreenWrapper avoidKeyboard>
      <Header onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
        <Typography variant="headline2" align="center">
          Welcome Back!
        </Typography>
        <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
          Login to your tenant account
        </Typography>

        <View style={{ alignItems: 'center', marginVertical: theme.spacing['3xl'] }}>
          <Image
            source={{ uri: 'https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg' }}
            style={{ width: 260, height: 200 }}
            resizeMode="contain"
          />
        </View>

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              maxLength={15}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
              leftIcon="call-outline"
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
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.lg }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl }}>
          <Typography variant="body" color={theme.colors.textMuted}>New tenant? </Typography>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Typography variant="bodyMedium" color={theme.colors.primary}>Sign Up</Typography>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
