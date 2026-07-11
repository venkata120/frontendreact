import { useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Input, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { MOBILE_REGEX, sanitizeMobile } from '../../src/utils/validation';

const schema = z.object({
  mobile: z
    .string()
    .min(10, 'Enter a valid 10-digit mobile number')
    .max(10, 'Enter a valid 10-digit mobile number')
    .regex(MOBILE_REGEX, 'Mobile number must start with 6-9 and contain 10 digits'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { sendOtp, otpLoading, error, resetError } = useAuth();

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
      // error handled by auth slice
    }
  };

  return (
    <ScreenWrapper avoidKeyboard scrollable>
      <Header onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
        <Typography variant="headline2" align="center">
          Welcome back Tenant!
        </Typography>
        <Typography
          variant="body"
          align="center"
          color={theme.colors.textMuted}
          style={{ marginTop: theme.spacing.sm }}
        >
          Enter your Mobile Number. We will send you OTP to verify
        </Typography>

        <Controller
          control={control}
          name="mobile"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={value}
              onChangeText={(text) => onChange(sanitizeMobile(text))}
              onBlur={onBlur}
              error={errors.mobile?.message}
              leftIcon={
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />
                  <Typography
                    variant="bodyMedium"
                    color={theme.colors.text}
                    style={{ marginLeft: theme.spacing.sm, marginRight: theme.spacing.xs }}
                  >
                    +91
                  </Typography>
                </View>
              }
              containerStyle={{ marginTop: theme.spacing['3xl'] }}
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

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: theme.spacing.lg,
          }}
        >
          <Typography variant="body" color={theme.colors.textMuted}>
            Don&apos;t have an account?{' '}
          </Typography>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Typography variant="body" color={theme.colors.primary} weight="600">
              Sign Up
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}
