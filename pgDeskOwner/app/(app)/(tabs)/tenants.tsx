import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, Avatar, PgSelector } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useDashboardOverview, useTenantsByPg, useRoomsWithBeds } from '../../../src/hooks/queries';

export default function TenantsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const currentMonth = useMemo(() => String(new Date().getMonth() + 1).padStart(2, '0'), []);
  const currentYear = useMemo(() => String(new Date().getFullYear()), []);
  const overviewParams = useMemo(
    () => ({ month: currentMonth, year: currentYear, userId: user?.id }),
    [currentMonth, currentYear, user?.id]
  );
  const { data: overview, refetch: refetchOverview } = useDashboardOverview(overviewParams);

  const pgSummary = useMemo(
    () => overview?.pgSummaries.find((p) => p.pgId === selectedPg?.id) || overview?.pgSummaries[0],
    [overview, selectedPg]
  );

  const { data: tenants, isLoading: tenantsLoading, refetch: refetchTenants } = useTenantsByPg(selectedPg?.id);
  const { data: roomsWithBeds, isLoading: roomsLoading, refetch: refetchRooms } = useRoomsWithBeds(selectedPg?.id);

  useFocusEffect(
    useCallback(() => {
      refetchOverview();
      if (selectedPg?.id) {
        refetchTenants();
        refetchRooms();
        qc.refetchQueries({ queryKey: ['rooms', 'pg', selectedPg.id] });
      }
    }, [refetchOverview, refetchTenants, refetchRooms, qc, selectedPg?.id])
  );
  const isLoading = tenantsLoading || roomsLoading;

  const tenantsWithRooms = useMemo(() => {
    if (!tenants) return [];
    if (!roomsWithBeds) return tenants.map((t) => ({ ...t, roomNumber: undefined }));
    const bedToRoom = new Map<string, { roomNumber: string; floor: number }>();
    roomsWithBeds.forEach((room) => {
      room.beds?.forEach((bed) => {
        bedToRoom.set(bed.id, { roomNumber: room.roomNumber, floor: room.floor });
      });
    });
    return tenants.map((t) => ({
      ...t,
      roomNumber: bedToRoom.get(t.bedId)?.roomNumber,
      floor: bedToRoom.get(t.bedId)?.floor,
    }));
  }, [tenants, roomsWithBeds]);

  const filtered = useMemo(() => {
    if (!tenantsWithRooms) return [];
    if (!search.trim()) return tenantsWithRooms;
    const q = search.toLowerCase();
    return tenantsWithRooms.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        (t.roomNumber && t.roomNumber.toLowerCase().includes(q))
    );
  }, [tenantsWithRooms, search]);

  const OVERVIEW_ITEMS = [
    {
      label: 'Active Tenants',
      value: String(pgSummary?.activeTenants ?? 0),
      icon: 'people',
      color: theme.colors.secondary,
      bg: theme.colors.primarySurface,
      route: '/(app)/(tabs)/tenants',
    },
    {
      label: 'Left Tenants',
      value: String(pgSummary?.leftTenants ?? 0),
      icon: 'person-remove',
      color: theme.colors.textTertiary,
      bg: theme.colors.backgroundSecondary,
      route: '/screens/left-tenants-profile',
    },
    {
      label: 'Collected Payments',
      value: `₹${Math.round(pgSummary?.monthlyRevenue ?? 0).toLocaleString()}`,
      icon: 'cash',
      color: theme.colors.success,
      bg: theme.colors.successSurface,
      route: '/screens/collected-amount',
    },
    {
      label: 'Pending Payments',
      value: `₹${Math.round(pgSummary?.pendingDues ?? 0).toLocaleString()}`,
      icon: 'time',
      color: theme.colors.warning,
      bg: theme.colors.warningSurface,
      route: '/screens/pending-dues',
    },
  ];

  return (
    <ScreenWrapper>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
              style={{ width: '100%', height: 180 }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.22)' }} />
            <View
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                right: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={openDrawer}>
                <Avatar size={44} uri="" name={user?.name} />
              </TouchableOpacity>
              <View style={{ marginLeft: theme.spacing.sm }}>
                <PgSelector />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/screens/notifications' as any)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FACC15',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications" size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search by name or Room" value={search} onChangeText={setSearch} />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: theme.spacing.sm }}>
            {OVERVIEW_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                onPress={() => item.route && router.push(item.route as any)}
                style={{ width: '48%', marginBottom: theme.spacing.md }}
              >
                <Card shadow="sm" padding={theme.spacing.md}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                      <Typography variant="caption" color={theme.colors.textMuted}>{item.label}</Typography>
                      <Typography variant="title2" color={item.color}>{item.value}</Typography>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Ionicons name="people" size={20} color={theme.colors.text} style={{ marginRight: 6 }} />
            <Typography variant="title1">All Tenants</Typography>
          </View>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading tenants...</Typography>}

          {!isLoading && filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg }}>
                <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <Typography variant="title1">Nothing found</Typography>
              <Typography variant="body" color={theme.colors.textMuted}>No tenants match your search.</Typography>
            </View>
          )}

          {filtered.map((tenant) => (
            <TouchableOpacity
              key={tenant.id}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/screens/tenants-profile' as any, params: { id: tenant.id } })}
            >
              <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar uri="" name={tenant.fullName} size={56} />
                  <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                    <Typography variant="title3">{tenant.fullName}</Typography>
                    <Typography variant="caption" color={theme.colors.primary}>Room {tenant.roomNumber || '-'}</Typography>
                    <Typography variant="bodyMedium" color={theme.colors.accentPurple}>₹{tenant.rentPerMonth.toLocaleString()}/month</Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/screens/add-tenant' as any, params: { pgId: selectedPg?.id } })}
          style={{
            position: 'absolute',
            bottom: insets.bottom,
            right: 16,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Ionicons name="add" size={28} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
