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
      <Stack.Screen name="(manager-tabs)" />
      <Stack.Screen name="all-screens" />
      <Stack.Screen name="screens/home-screen" />
      <Stack.Screen name="screens/tenant-screen" />
      <Stack.Screen name="screens/rooms-screen" />
      <Stack.Screen name="screens/staff-management" />
      <Stack.Screen name="screens/profile-screen-1" />
      <Stack.Screen name="screens/assign-manager" />
      <Stack.Screen name="screens/login" />
      <Stack.Screen name="screens/help-support" />
      <Stack.Screen name="screens/splash-screen-1" />
      <Stack.Screen name="screens/add-room" />
      <Stack.Screen name="screens/manager-assigned-successfully" />
      <Stack.Screen name="screens/splash-screen-2" />
      <Stack.Screen name="screens/help-support-chat-bot" />
      <Stack.Screen name="screens/manager-profile" />
      <Stack.Screen name="screens/side-bar" />
      <Stack.Screen name="screens/owner-login" />
      <Stack.Screen name="screens/splash-screen-3" />
      <Stack.Screen name="screens/property-details" />
      <Stack.Screen name="screens/review-details" />
      <Stack.Screen name="screens/manager-login" />
      <Stack.Screen name="screens/splash-screen-8" />
      <Stack.Screen name="screens/splash-screen-5" />
      <Stack.Screen name="screens/tenant-screen-empty-state" />
      <Stack.Screen name="screens/signup-1" />
      <Stack.Screen name="screens/manage-all-permissions" />
      <Stack.Screen name="screens/tenants-profile" />
      <Stack.Screen name="screens/signup-2" />
      <Stack.Screen name="screens/collected-amount" />
      <Stack.Screen name="screens/otp-verification" />
      <Stack.Screen name="screens/add-property" />
      <Stack.Screen name="screens/bed-category" />
      <Stack.Screen name="screens/bed-details" />
      <Stack.Screen name="screens/left-tenants-profile" />
      <Stack.Screen name="screens/access-requests" />
      <Stack.Screen name="screens/payments-salary-history" />
      <Stack.Screen name="screens/notice-board" />
      <Stack.Screen name="screens/left-tenants-profile-empty-state" />
      <Stack.Screen name="screens/installation-of-property-2" />
      <Stack.Screen name="screens/installation-of-property-3" />
      <Stack.Screen name="screens/edit-tenant" />
      <Stack.Screen name="screens/food-menu" />
      <Stack.Screen name="screens/succesfully-added" />
      <Stack.Screen name="screens/pending-dues" />
      <Stack.Screen name="screens/pending-dues-empty-state" />
      <Stack.Screen name="screens/notifications" />
      <Stack.Screen name="screens/allocate-room" />
      <Stack.Screen name="screens/profile-screen-2" />
      <Stack.Screen name="screens/expenses-list" />
      <Stack.Screen name="screens/food-mess-charges" />
      <Stack.Screen name="screens/utility-charges" />
      <Stack.Screen name="screens/income" />
    </Stack>
  );
}
