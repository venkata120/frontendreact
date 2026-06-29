import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper, Header, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const SCREENS = [
  {
    "label": "tenant login 1",
    "route": "/(app)/screens/tenant-login-1"
  },
  {
    "label": "support",
    "route": "/(app)/screens/support"
  },
  {
    "label": "tenant login 4",
    "route": "/(app)/screens/tenant-login-4"
  },
  {
    "label": "otp signup",
    "route": "/(app)/screens/otp-signup"
  },
  {
    "label": "terms and conditions",
    "route": "/(app)/screens/terms-and-conditions"
  },
  {
    "label": "tenant login 2",
    "route": "/(app)/screens/tenant-login-2"
  },
  {
    "label": "mbl number -signup",
    "route": "/(app)/screens/mbl-number-signup"
  },
  {
    "label": "tenant login 3",
    "route": "/(app)/screens/tenant-login-3"
  },
  {
    "label": "request sent",
    "route": "/(app)/screens/request-sent"
  },
  {
    "label": "register",
    "route": "/(app)/screens/register"
  },
  {
    "label": "request sent-2",
    "route": "/(app)/screens/request-sent-2"
  },
  {
    "label": "request sent-3",
    "route": "/(app)/screens/request-sent-3"
  },
  {
    "label": "hstl code",
    "route": "/(app)/screens/hstl-code"
  },
  {
    "label": "request approval",
    "route": "/(app)/screens/request-approval"
  },
  {
    "label": "hstl details-tenant",
    "route": "/(app)/screens/hstl-details-tenant"
  },
  {
    "label": "request approval-2",
    "route": "/(app)/screens/request-approval-2"
  },
  {
    "label": "drafts notices",
    "route": "/(app)/screens/drafts-notices"
  },
  {
    "label": "complaints",
    "route": "/(app)/screens/complaints"
  },
  {
    "label": "animation req sent",
    "route": "/(app)/screens/animation-req-sent"
  },
  {
    "label": "animation req sent-2",
    "route": "/(app)/screens/animation-req-sent-2"
  },
  {
    "label": "animation req sent-3",
    "route": "/(app)/screens/animation-req-sent-3"
  },
  {
    "label": "terms & Conditions",
    "route": "/(app)/screens/terms-conditions"
  },
  {
    "label": "animation req sent-4",
    "route": "/(app)/screens/animation-req-sent-4"
  },
  {
    "label": "terms ",
    "route": "/(app)/screens/terms"
  }
];

export default function AllScreensScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <Header title="All Tenant Screens" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          {SCREENS.map((screen) => (
            <TouchableOpacity key={screen.route} onPress={() => router.push(screen.route as any)}>
              <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <Typography variant="bodyMedium">{screen.label}</Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>{screen.route}</Typography>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
