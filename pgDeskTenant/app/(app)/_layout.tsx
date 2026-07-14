import { Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function AppLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="all-screens" />
      <Stack.Screen name="screens/tenant-login-1" />
      <Stack.Screen name="screens/support" />
      <Stack.Screen name="screens/notifications" />
      <Stack.Screen name="screens/tenant-login-4" />
      <Stack.Screen name="screens/otp-signup" />
      <Stack.Screen name="screens/terms-and-conditions" />
      <Stack.Screen name="screens/tenant-login-2" />
      <Stack.Screen name="screens/mbl-number-signup" />
      <Stack.Screen name="screens/tenant-login-3" />
      <Stack.Screen name="screens/request-sent" />
      <Stack.Screen name="screens/register" />
      <Stack.Screen name="screens/request-sent-2" />
      <Stack.Screen name="screens/request-sent-3" />
      <Stack.Screen name="screens/hstl-code" />
      <Stack.Screen name="screens/request-approval" />
      <Stack.Screen name="screens/hstl-details-tenant" />
      <Stack.Screen name="screens/request-approval-2" />
      <Stack.Screen name="screens/drafts-notices" />
      <Stack.Screen name="screens/complaints" />
      <Stack.Screen name="screens/animation-req-sent" />
      <Stack.Screen name="screens/animation-req-sent-2" />
      <Stack.Screen name="screens/animation-req-sent-3" />
      <Stack.Screen name="screens/terms-conditions" />
      <Stack.Screen name="screens/animation-req-sent-4" />
      <Stack.Screen name="screens/terms" />
    </Stack>
  );
}
