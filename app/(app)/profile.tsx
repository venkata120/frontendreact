import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, ProfileImagePicker } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useProperties, useDashboardOverview } from '../../src/hooks/queries';
import { confirmAction } from '../../src/utils/uiHelpers';
import { useMemo } from 'react';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { selectedPg } = useSelectedPg();
  const { data: properties } = useProperties(user?.id);

  const currentMonth = useMemo(() => String(new Date().getMonth() + 1).padStart(2, '0'), []);
  const { data: overview } = useDashboardOverview({
    month: currentMonth,
    year: String(new Date().getFullYear()),
    userId: user?.id,
  });

  const pgSummary = useMemo(
    () => overview?.pgSummaries.find((p) => p.pgId === selectedPg?.id) || overview?.pgSummaries[0],
    [overview, selectedPg]
  );

  const stats = [
    { label: 'Properties', value: String(properties?.length ?? 0), icon: 'business' },
    { label: 'Rooms', value: String(pgSummary?.totalRooms ?? 0), icon: 'bed' },
    { label: 'Tenants', value: String(pgSummary?.totalTenants ?? 0), icon: 'people' },
  ];

  const infoItems = [
    { label: 'Property Name', value: selectedPg?.name || '-', icon: 'business-outline', color: '#4F39F6' },
    { label: 'Phone Number', value: user?.mobile || '-', icon: 'call-outline', color: '#0065F4' },
    { label: 'Email', value: user?.email || '-', icon: 'mail-outline', color: '#E27305' },
    { label: 'Address', value: selectedPg?.address || user?.email || '-', icon: 'location-outline', color: '#0065F4' },
  ];

  const quickLinks = [
    { label: 'Subscription', icon: 'ribbon', color: '#F59E0B', route: '' },
    { label: 'Wallet', icon: 'wallet', color: '#82181A', route: '' },
    { label: 'All Screens', icon: 'list', color: '#0065F4', route: '/(app)/all-screens' },
    { label: 'Help & Support', icon: 'help-circle', color: '#00A63E', route: '/(app)/help' },
  ];

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.colors.white,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>My Profile</Typography>
          <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="create-outline" size={18} color={theme.colors.white} />
            <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 4 }}>Edit</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg} style={{ alignItems: 'center' }}>
            <ProfileImagePicker
              size={90}
              uri={user?.avatar}
              name={user?.name || 'Owner'}
              profileType="OWNER"
              entityId={user?.id}
              onUploaded={(result) => {
                // Optionally update redux / local user state with result.objectUrl
                console.log('[Profile] uploaded', result.objectUrl);
              }}
            />
            <Typography variant="headline2" style={{ marginTop: theme.spacing.md }}>{user?.name || 'Owner'}</Typography>
            <Typography variant="body" color={theme.colors.textMuted}>{selectedPg?.name || 'PG Desk Owner'}</Typography>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
                marginTop: theme.spacing.lg,
                paddingTop: theme.spacing.lg,
                borderTopWidth: 1,
                borderTopColor: theme.colors.borderLight,
              }}
            >
              {stats.map((stat, index) => (
                <View key={stat.label} style={{ flex: 1, alignItems: 'center', borderRightWidth: index < stats.length - 1 ? 1 : 0, borderRightColor: theme.colors.borderLight }}>
                  <Ionicons name={stat.icon as any} size={20} color={theme.colors.primary} />
                  <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 4 }}>{stat.label}</Typography>
                  <Typography variant="headline2" color={theme.colors.text}>{stat.value}</Typography>
                </View>
              ))}
            </View>
          </Card>

          <Typography variant="title1" style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}>Personal Information</Typography>

          {infoItems.map((item) => (
            <Card key={item.label} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ width: 40, alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                  <Typography variant="caption" color={theme.colors.textMuted}>{item.label}</Typography>
                  <Typography variant="bodyMedium">{item.value}</Typography>
                </View>
              </View>
            </Card>
          ))}

          <Typography variant="title1" style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.md }}>Quick Links</Typography>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {quickLinks.map((link) => (
              <TouchableOpacity
                key={link.label}
                activeOpacity={0.8}
                onPress={() => link.route && router.push(link.route as any)}
                style={{ width: '48%', marginBottom: theme.spacing.md }}
              >
                <Card shadow="sm" padding={theme.spacing.md} style={{ alignItems: 'center' }}>
                  <Ionicons name={link.icon as any} size={24} color={link.color} />
                  <Typography variant="caption" style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}>{link.label}</Typography>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => confirmAction('Logout', 'Are you sure you want to logout?', signOut)}
            style={{
              backgroundColor: theme.colors.danger,
              borderRadius: theme.radius.full,
              paddingVertical: theme.spacing.md,
              alignItems: 'center',
              marginTop: theme.spacing.md,
              marginBottom: theme.spacing.xl,
            }}
          >
            <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>Logout</Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
