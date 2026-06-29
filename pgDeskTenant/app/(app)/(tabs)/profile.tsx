import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar, Button } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';

const INFO_ITEMS = [
  { label: 'Floor', value: 'Ground Floor', icon: 'trail-sign-outline' },
  { label: 'Room Number', value: '101', icon: 'bed-outline' },
  { label: 'Bed Number', value: '101 B', icon: 'checkbox-outline' },
  { label: 'Date of Check-in', value: '22-05-2026', icon: 'calendar-outline' },
  { label: 'Rent Amount', value: '₹ 10,000', icon: 'cash-outline' },
  { label: 'Deposit Amount', value: '₹ 2,000', icon: 'card-outline' },
  { label: 'Maintenance Amount', value: '₹ 1,000', icon: 'construct-outline' },
  { label: 'Refundable Amount', value: '₹ 1,000', icon: 'wallet-outline' },
];

const MENU_ITEMS = [
  { icon: 'create-outline', label: 'Edit Profile', route: '/(app)/edit-profile' },
  { icon: 'wallet-outline', label: 'My Dues', route: '/(app)/pending-dues' },
  { icon: 'notifications-outline', label: 'Notifications', route: '' },
  { icon: 'help-circle-outline', label: 'Help & Support', route: '/(app)/screens/support' },
  { icon: 'list-outline', label: 'All Screens', route: '/(app)/all-screens' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <ScreenWrapper>
      {/* Blue header */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="headline2" color={theme.colors.white}>
            My Profile
          </Typography>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/pending-dues')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.success,
              paddingVertical: 6,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.full,
            }}
          >
            <Typography variant="caption" color={theme.colors.white} style={{ fontWeight: '600' }}>
              Received payments
            </Typography>
            <Ionicons name="document-text" size={14} color={theme.colors.white} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.md }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          {/* Profile card */}
          <Card shadow="lg" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar size={70} uri="https://i.pravatar.cc/150?u=tenant" name={user?.name || 'Raj Kumar'} />
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Typography variant="title1">{user?.name || 'Raj Kumar'}</Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success, marginRight: 4 }} />
                  <Typography variant="caption" color={theme.colors.success}>Active</Typography>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.8}>
                <Ionicons name="call" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Tenant information */}
          <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="person-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title2">tenant information</Typography>
            </View>
            {INFO_ITEMS.map((item) => (
              <View
                key={item.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.borderLight,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={item.icon as any} size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
                  <Typography variant="body" color={theme.colors.textMuted}>{item.label}</Typography>
                </View>
                <Typography variant="bodyMedium" color={theme.colors.primary}>{item.value}</Typography>
              </View>
            ))}
          </Card>

          {/* Menu */}
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} activeOpacity={0.8} onPress={() => item.route && router.push(item.route as any)}>
              <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={item.icon as any} size={22} color={theme.colors.primary} />
                    <Typography variant="bodyMedium" style={{ marginLeft: theme.spacing.md }}>{item.label}</Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          <Button title="Logout" variant="danger" onPress={signOut} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xl }} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
