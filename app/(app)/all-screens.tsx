import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenWrapper, Header, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const SCREENS = [
  {
    "label": "home screen ",
    "route": "/screens/home-screen"
  },
  {
    "label": "tenant screen",
    "route": "/screens/tenant-screen"
  },
  {
    "label": "Rooms Screen",
    "route": "/screens/rooms-screen"
  },
  {
    "label": "Staff Management",
    "route": "/screens/staff-management"
  },
  {
    "label": "profile screen 1",
    "route": "/screens/profile-screen-1"
  },
  {
    "label": "assign manager",
    "route": "/screens/assign-manager"
  },
  {
    "label": "login",
    "route": "/screens/login"
  },
  {
    "label": "help & support",
    "route": "/screens/help-support"
  },
  {
    "label": "Splash Screen 1",
    "route": "/screens/splash-screen-1"
  },
  {
    "label": "add room",
    "route": "/screens/add-room"
  },
  {
    "label": "Manager Assigned Successfully !",
    "route": "/screens/manager-assigned-successfully"
  },
  {
    "label": "Splash Screen 2",
    "route": "/screens/splash-screen-2"
  },
  {
    "label": "Help & Support / Chat Bot",
    "route": "/screens/help-support-chat-bot"
  },
  {
    "label": "Manager Profile",
    "route": "/screens/manager-profile"
  },
  {
    "label": "side bar",
    "route": "/screens/side-bar"
  },
  {
    "label": "owner login",
    "route": "/screens/owner-login"
  },
  {
    "label": "Splash Screen 3",
    "route": "/screens/splash-screen-3"
  },
  {
    "label": "Property Details",
    "route": "/screens/property-details"
  },
  {
    "label": "manager login",
    "route": "/screens/manager-login"
  },
  {
    "label": "Splash Screen 8",
    "route": "/screens/splash-screen-8"
  },
  {
    "label": "Splash Screen 5",
    "route": "/screens/splash-screen-5"
  },
  {
    "label": "tenant screen empty state",
    "route": "/screens/tenant-screen-empty-state"
  },
  {
    "label": "Signup 1",
    "route": "/screens/signup-1"
  },
  {
    "label": "Manage All Permissions",
    "route": "/screens/manage-all-permissions"
  },
  {
    "label": "tenants profile",
    "route": "/screens/tenants-profile"
  },
  {
    "label": "Signup 2",
    "route": "/screens/signup-2"
  },
  {
    "label": "collected amount",
    "route": "/screens/collected-amount"
  },
  {
    "label": "otp verification",
    "route": "/screens/otp-verification"
  },
  {
    "label": "Add property",
    "route": "/screens/add-property"
  },
  {
    "label": "left tenants profile",
    "route": "/screens/left-tenants-profile"
  },
  {
    "label": "Access requests",
    "route": "/screens/access-requests"
  },
  {
    "label": "Signup owner",
    "route": "/(auth)/signup-owner"
  },
  {
    "label": "payments (salary) history",
    "route": "/screens/payments-salary-history"
  },
  {
    "label": "installation of property",
    "route": "/(auth)/installation-of-property"
  },
  {
    "label": "notice board",
    "route": "/screens/notice-board"
  },
  {
    "label": "left tenants profile empty state",
    "route": "/screens/left-tenants-profile-empty-state"
  },
  {
    "label": "installation of property-2",
    "route": "/screens/installation-of-property-2"
  },
  {
    "label": "installation of property-3",
    "route": "/screens/installation-of-property-3"
  },
  {
    "label": "edit tenant ",
    "route": "/screens/edit-tenant"
  },
  {
    "label": "food menu",
    "route": "/screens/food-menu"
  },
  {
    "label": "review details",
    "route": "/(auth)/review-details"
  },
  {
    "label": "succesfully added",
    "route": "/screens/succesfully-added"
  },
  {
    "label": "pending dues",
    "route": "/screens/pending-dues"
  },
  {
    "label": "pending dues empty state",
    "route": "/screens/pending-dues-empty-state"
  },
  {
    "label": "notifications",
    "route": "/screens/notifications"
  },
  {
    "label": "allocate room",
    "route": "/screens/allocate-room"
  },
  {
    "label": "profile screen 2",
    "route": "/screens/profile-screen-2"
  }
];

export default function AllScreensScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <Header title="All Owner Screens" onBack={() => router.back()} />
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
