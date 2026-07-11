import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { ScreenWrapper, Typography, Button, OTPInput, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';

const RESEND_COOLDOWN_SECONDS = 30;

function maskMobile(mobile: string) {
  if (mobile.length >= 4) {
    return `+91 ••••••${mobile.slice(-4)}`;
  }
  return `+91 ${mobile}`;
}

export default function OTPScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile?: string }>();
  const { verifyOtp, resendOtp, sendOtp, otpReqId, otpLoading, loading, error, resetError } = useAuth();

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (!mobile || !otpReqId || otp.length !== 6) return;
    resetError();
    try {
      await verifyOtp(mobile, otp);
      router.replace('/(app)/(tabs)');
    } catch {
      // error handled by auth slice
    }
  };

  const handleResend = async () => {
    if (!mobile || !otpReqId || countdown > 0) return;
    resetError();
    try {
      await resendOtp(otpReqId);
      setOtp('');
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch {
      // error handled by auth slice
    }
  };

  if (!mobile) {
    return (
      <ScreenWrapper>
        <Header onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.base }}>
          <Typography variant="body" color={theme.colors.textMuted} align="center">
            Mobile number is missing. Please go back and try again.
          </Typography>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: theme.spacing.lg }} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper avoidKeyboard scrollable>
      <Header onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
        <Typography variant="headline2" align="center">
          Enter OTP
        </Typography>
        <Typography
          variant="body"
          align="center"
          color={theme.colors.textMuted}
          style={{ marginTop: theme.spacing.sm }}
        >
          We have sent a 6-digit code to{'\n'}
          {maskMobile(mobile)}
        </Typography>

        <View style={{ marginTop: theme.spacing['3xl'] }}>
          <OTPInput value={otp} onChange={setOtp} disabled={loading || otpLoading} />
        </View>

        {error && (
          <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
            {error}
          </Typography>
        )}

        <Button
          title="Verify OTP"
          loading={loading}
          disabled={otp.length !== 6}
          onPress={handleVerify}
          style={{ marginTop: theme.spacing.lg }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.lg }}>
          <Typography variant="body" color={theme.colors.textMuted}>
            Didn’t receive it?{' '}
          </Typography>
          {countdown > 0 ? (
            <Typography variant="body" color={theme.colors.textMuted}>
              Resend in {countdown}s
            </Typography>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={otpLoading}>
              <Typography variant="body" color={theme.colors.primary} weight="600">
                Resend OTP
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}
