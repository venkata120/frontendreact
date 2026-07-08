import { useRouter } from 'expo-router';
import { useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useTenant } from '../../../src/context/TenantContext';
import { useTenantDetails } from '../../../src/hooks/queries/useTenant';
import { useAnnouncementsByPg } from '../../../src/hooks/queries/useAnnouncements';
import { formatCurrency, formatDate } from '../../../src/utils/formatters';

const QUICK_ACTIONS = [
  { icon: 'wallet-outline', label: 'My Dues', route: '/(app)/pending-dues' },
  { icon: 'restaurant-outline', label: 'Food Menu', route: '/(app)/(tabs)/menu' },
  { icon: 'document-text-outline', label: 'Notices', route: '/(app)/(tabs)/notices' },
  { icon: 'chatbubble-outline', label: 'Support', route: '/(app)/screens/support' },
];

export default function TenantHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const navigating = useRef(false);

  const navigateOnce = useCallback((route: string) => {
    if (navigating.current) return;
    navigating.current = true;
    router.push(route as any);
    setTimeout(() => {
      navigating.current = false;
    }, 500);
  }, [router]);
  const { user } = useAuth();
  const { tenantId, propertyId } = useTenant();
  const { data: tenantDetails, isLoading: isTenantLoading } = useTenantDetails(tenantId ?? undefined);
  const { data: announcements } = useAnnouncementsByPg(propertyId ?? undefined);

  const latestAnnouncement = announcements?.[0];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header image with overlay */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
            style={{ width: '100%', height: 190 }}
            resizeMode="cover"
          />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.22)' }} />
          <View style={{ position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar size={46} uri={user?.avatar} name={user?.name || tenantDetails?.fullName || 'Tenant'} />
              <View style={{ marginLeft: theme.spacing.sm }}>
                <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>
                  {user?.name || tenantDetails?.fullName || 'Tenant'}
                </Typography>
                <Typography variant="caption" color={theme.colors.white}>Student</Typography>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigateOnce('/screens/notifications')}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FACC15', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="notifications" size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.lg }}>
              <Typography variant="bodyMedium" color={theme.colors.white}>Floor - </Typography>
              <Typography variant="title2" color={theme.colors.white}>{tenantDetails?.floor ?? '-'}</Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="bodyMedium" color={theme.colors.white}>Room - </Typography>
              <Typography variant="title2" color={theme.colors.white}>{tenantDetails?.roomNumber ?? '-'}</Typography>
            </View>
          </View>
        </View>

        <View style={{ padding: theme.spacing.base }}>
          {/* Rent Status */}
          <Card shadow="lg" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg, backgroundColor: theme.colors.primary }}>
            {isTenantLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Typography variant="caption" color={theme.colors.white}>Monthly Rent</Typography>
                  <Typography variant="headline1" color={theme.colors.white}>{formatCurrency(tenantDetails?.rentPerMonth ?? 0)}</Typography>
                  <Typography variant="caption" color={theme.colors.white} style={{ opacity: 0.8 }}>
                    Due on {tenantDetails?.rentLedgers?.[0]?.dueDate ? formatDate(tenantDetails.rentLedgers[0].dueDate) : '05th of month'}
                  </Typography>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: theme.colors.white,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.radius.full,
                  }}
                  onPress={() => navigateOnce('/(app)/pending-dues')}
                >
                  <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '600' }}>Pay Now</Typography>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Quick Actions */}
          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Quick Actions</Typography>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
            {QUICK_ACTIONS.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                style={{ alignItems: 'center', width: '22%' }}
                onPress={() => navigateOnce(item.route)}
              >
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: theme.colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xs }}>
                  <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <Typography variant="caption" align="center">{item.label}</Typography>
              </TouchableOpacity>
            ))}
          </View>

          {/* Latest Announcement */}
          {latestAnnouncement && (
            <>
              <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Latest Announcement</Typography>
              <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
                <Typography variant="title2" color={theme.colors.primary}>{latestAnnouncement.title}</Typography>
                <Typography variant="body" color={theme.colors.textSecondary} numberOfLines={2} style={{ marginTop: theme.spacing.xs }}>
                  {latestAnnouncement.description}
                </Typography>
              </Card>
            </>
          )}

          {/* Room Info */}
          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>My Room</Typography>
          <Card shadow="md" padding={theme.spacing.lg}>
            {[
              { label: 'Room Number', value: tenantDetails?.roomNumber ?? '-' },
              { label: 'Bed Number', value: tenantDetails?.bedNumber ?? '-' },
              { label: 'Floor', value: tenantDetails?.floor?.toString() ?? '-' },
              { label: 'Check-in Date', value: tenantDetails?.joinDate ? formatDate(tenantDetails.joinDate) : '-' },
            ].map((item, index, arr) => (
              <View
                key={item.label}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.sm,
                  borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.borderLight,
                }}
              >
                <Typography variant="body" color={theme.colors.textMuted}>{item.label}</Typography>
                <Typography variant="bodyMedium">{item.value}</Typography>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
