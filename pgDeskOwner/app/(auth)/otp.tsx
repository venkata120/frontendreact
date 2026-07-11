import { useEffect, useState, useCallback } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { ScreenWrapper, Typography, Button, Header, OTPInput } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { getRoleBasedRoute } from '../../src/utils/roleRouting';
import type { RootState } from '../../src/redux/store';

const RESEND_TIMEOUT_SECONDS = 30;

export default function OTPScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const { verifyOtp, resendOtp, loading, otpLoading, error, resetError, isAuthenticated, userRole } = useAuth();
  const reqId = useSelector((state: RootState) => state.auth.otpReqId);

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(RESEND_TIMEOUT_SECONDS);

  const maskedMobile = mobile ? `+91 ${mobile.replace(/\d(?=\d{4})/g, '*')}` : '';

  useEffect(() => {
    if (isAuthenticated && userRole) {
      router.replace(getRoleBasedRoute(userRole));
    }
  }, [isAuthenticated, userRole, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    resetError();
    if (!mobile || otp.length < 6) return;
    try {
      await verifyOtp(mobile, otp);
    } catch {
      // handled by redux
    }
  };

  const handleResend = useCallback(async () => {
    resetError();
    if (!reqId) return;
    try {
      await resendOtp(reqId);
      setCountdown(RESEND_TIMEOUT_SECONDS);
      setOtp('');
    } catch {
      // handled by redux
    }
  }, [reqId, resetError, resendOtp]);

  return (
    <ScreenWrapper avoidKeyboard>
      <Header onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
          <Typography variant="headline2" align="center">
            Enter OTP
          </Typography>
          <Typography
            variant="body"
            align="center"
            color={theme.colors.textMuted}
            style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing['3xl'] }}
          >
            We have sent a 6 digits Verification code to your phone number {maskedMobile}
          </Typography>

          <OTPInput value={otp} onChange={setOtp} disabled={loading || otpLoading} />

          {error && (
            <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.md }}>
              {error}
            </Typography>
          )}

          <Button
            title="Verify OTP"
            loading={loading}
            disabled={otp.length < 6}
            onPress={handleVerify}
            style={{ marginTop: theme.spacing.lg }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: theme.spacing.xl }}>
            {countdown > 0 ? (
              <Typography variant="body" color={theme.colors.textMuted}>
                Resend OTP in {countdown}s
              </Typography>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={otpLoading}>
                <Typography variant="bodyMedium" color={theme.colors.primary}>
                  {otpLoading ? 'Sending...' : 'Resend OTP'}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
