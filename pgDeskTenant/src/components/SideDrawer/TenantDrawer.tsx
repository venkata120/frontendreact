import React, { useRef, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SideDrawer } from './SideDrawer';
import { Typography, Avatar, Card, Button } from '../';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../context/TenantContext';
import { useTenantDetails } from '../../hooks/queries/useTenant';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  onPress?: () => void;
  danger?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const TenantDrawer: React.FC<Props> = ({ visible, onClose }) => {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { tenantId } = useTenant();
  const { data: tenantDetails, isLoading } = useTenantDetails(tenantId ?? undefined);
  const navigating = useRef(false);

  const navigateOnce = useCallback(
    (route: string) => {
      if (navigating.current) return;
      navigating.current = true;
      onClose();
      // Give the drawer a moment to close before navigating to avoid visual glitches.
      setTimeout(() => {
        router.navigate(route as any);
        navigating.current = false;
      }, 200);
    },
    [onClose, router]
  );

  const handleCall = async () => {
    const phone = tenantDetails?.phone;
    if (!phone) {
      Alert.alert('No phone number', 'Phone number is not available.');
      return;
    }
    const url = `tel:${phone.replace(/\D/g, '')}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (err: any) {
      Alert.alert('Unable to call', err?.message || 'No calling app is available.');
    }
  };

  const infoItems = tenantDetails
    ? [
        { label: 'Floor', value: tenantDetails.floor?.toString() ?? '-', icon: 'trail-sign-outline' as const },
        { label: 'Room', value: tenantDetails.roomNumber ?? '-', icon: 'bed-outline' as const },
        { label: 'Bed', value: tenantDetails.bedNumber ?? '-', icon: 'checkbox-outline' as const },
        { label: 'Check-in', value: formatDate(tenantDetails.joinDate), icon: 'calendar-outline' as const },
      ]
    : [];

  const menuItems: MenuItem[] = [
    { icon: 'create-outline', label: 'Edit Profile', route: '/(app)/edit-profile' },
    { icon: 'wallet-outline', label: 'My Dues', route: '/(app)/pending-dues' },
    { icon: 'restaurant-outline', label: 'Food Menu', route: '/(app)/(tabs)/menu' },
    { icon: 'notifications-outline', label: 'Notices', route: '/(app)/(tabs)/notices' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: '/screens/support' },
  ];

  const handleLogout = () => {
    onClose();
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SideDrawer visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Profile header - blue rounded bottom to match owner sidebar style */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderBottomRightRadius: 40,
            paddingTop: theme.spacing.xl,
            paddingBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.base,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar
                size={64}
                uri={user?.avatar}
                name={user?.name || tenantDetails?.fullName || 'Tenant'}
              />
              <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                <Typography variant="title1" color={theme.colors.white} numberOfLines={1} ellipsizeMode="tail">
                  {user?.name || tenantDetails?.fullName || 'Tenant'}
                </Typography>
                <Typography variant="caption" color={theme.colors.white} numberOfLines={1} ellipsizeMode="tail">
                  {user?.email || tenantDetails?.email || ''}
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.colors.success,
                      marginRight: 6,
                    }}
                  />
                  <Typography variant="caption" color={theme.colors.success}>
                    Active Tenant
                  </Typography>
                </View>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCall}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="call" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          {/* Quick rent summary */}
          <View
            style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: theme.radius.lg,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" color={theme.colors.white}>
                Monthly Rent
              </Typography>
              <Typography variant="title2" color={theme.colors.white}>
                {formatCurrency(tenantDetails?.rentPerMonth ?? 0)}
              </Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <Typography variant="caption" color={theme.colors.white}>
                Deposit
              </Typography>
              <Typography variant="bodyMedium" color={theme.colors.white}>
                {formatCurrency(tenantDetails?.advanceAmount ?? 0)}
              </Typography>
            </View>
          </View>
        </View>

        {/* Room info */}
        <View style={{ padding: theme.spacing.base }}>
          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>
            My Room
          </Typography>
          {isLoading ? (
            <Typography variant="body" color={theme.colors.textMuted}>
              Loading...
            </Typography>
          ) : (
            <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
              {infoItems.map((item, index) => (
                <View
                  key={item.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: index < infoItems.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.borderLight,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={item.icon} size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Typography variant="body" color={theme.colors.textMuted}>
                      {item.label}
                    </Typography>
                  </View>
                  <Typography variant="bodyMedium" color={theme.colors.primary}>
                    {item.value}
                  </Typography>
                </View>
              ))}
            </Card>
          )}

          {/* Menu */}
          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>
            Menu
          </Typography>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={() => (item.route ? navigateOnce(item.route) : item.onPress?.())}
            >
              <Card
                shadow="sm"
                padding={theme.spacing.md}
                style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.primarySurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: theme.spacing.md,
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.danger ? theme.colors.danger : theme.colors.primary}
                  />
                </View>
                <Typography
                  variant="bodyMedium"
                  color={item.danger ? theme.colors.danger : theme.colors.text}
                  style={{ flex: 1 }}
                >
                  {item.label}
                </Typography>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </Card>
            </TouchableOpacity>
          ))}

          <Button
            title="Logout"
            variant="danger"
            leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.danger} />}
            onPress={handleLogout}
            style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xl }}
          />
        </View>
      </ScrollView>
    </SideDrawer>
  );
};
