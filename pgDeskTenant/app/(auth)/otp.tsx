import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { ScreenWrapper, Typography, Button, Header, OTPInput } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';

export default function OTPScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const { confirmOTP, requestOTP, loading, error } = useAuth();

  const handleVerify = async () => {
    if (otp.length !== 4) return;
    try {
      await confirmOTP(phone, otp);
      router.replace('/(app)/(tabs)');
    } catch (e) {
      // handled
    }
  };

  const handleResend = async () => {
    setOtp('');
    await requestOTP(phone, 'tenant');
  };

  return (
    <ScreenWrapper avoidKeyboard>
      <Header onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
        <View style={{ alignItems: 'center', marginBottom: theme.spacing['3xl'] }}>
          <Image
            source={{ uri: 'https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg' }}
            style={{ width: 260, height: 200 }}
            resizeMode="contain"
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
          <Typography variant="headline2">Enter OTP</Typography>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: theme.colors.secondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: theme.spacing.sm,
            }}
          >
            <Typography variant="caption" color={theme.colors.white}>👤</Typography>
          </View>
        </View>

        <Typography variant="body" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.lg }}>
          We have sent a 4 digits Verification code to your phone number {phone ? `+91 ${phone}` : '+91 *******320'}
        </Typography>

        <OTPInput value={otp} onChange={setOtp} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}>
          <Typography variant="caption" color={theme.colors.textMuted}>Resend OTP in</Typography>
          <TouchableOpacity onPress={handleResend} disabled={loading}>
            <Typography variant="captionMedium" color={theme.colors.primary}>Resend OTP</Typography>
          </TouchableOpacity>
        </View>

        {error && (
          <Typography variant="caption" color={theme.colors.danger} style={{ marginBottom: theme.spacing.sm }}>
            {error}
          </Typography>
        )}

        <Button title="Verify OTP" loading={loading} disabled={otp.length !== 4} onPress={handleVerify} />

        <Button title="Resend OTP" variant="outline" onPress={handleResend} disabled={loading} style={{ marginTop: theme.spacing.md }} />
      </View>
    </ScreenWrapper>
  );
}
