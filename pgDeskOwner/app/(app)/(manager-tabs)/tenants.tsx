import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, Avatar, PgSelector } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useDashboardOverview, useTenantsByPg, useRoomsWithBeds } from '../../../src/hooks/queries';
import { ROUTES } from '../../../src/constants';
import type { Tenant } from '../../../src/types';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

export default function ManagerTenantsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();
  const managerId = user?.id;

  const [search, setSearch] = useState('');

  const currentMonth = useMemo(() => String(new Date().getMonth() + 1).padStart(2, '0'), []);
  const currentYear = useMemo(() => String(new Date().getFullYear()), []);
  const overviewParams = useMemo(
    () => ({ month: currentMonth, year: currentYear, managerId }),
    [currentMonth, currentYear, managerId]
  );
  const { data: overview, refetch: refetchOverview } = useDashboardOverview(overviewParams);

  const { data: tenants, isLoading: tenantsLoading, refetch: refetchTenants } = useTenantsByPg(selectedPg?.id);
  const { data: roomsWithBeds, isLoading: roomsLoading, refetch: refetchRooms } = useRoomsWithBeds(selectedPg?.id);

  useFocusEffect(
    useCallback(() => {
      refetchOverview();
      if (selectedPg?.id) {
        refetchTenants();
        refetchRooms();
        qc.refetchQueries({ queryKey: ['rooms', 'pg', selectedPg.id] });
        qc.refetchQueries({ queryKey: ['tenants', 'pg', selectedPg.id] });
      }
    }, [refetchOverview, refetchTenants, refetchRooms, qc, selectedPg?.id])
  );

  const pgSummary = useMemo(
    () => overview?.pgSummaries.find((p) => p.pgId === selectedPg?.id) || overview?.pgSummaries[0],
    [overview, selectedPg]
  );

  const bedMap = useMemo(() => {
    const map = new Map<string, { roomNumber: string; bedNumber: string; floor: number }>();
    roomsWithBeds?.forEach((room) => {
      room.beds?.forEach((bed) => {
        map.set(bed.id, { roomNumber: room.roomNumber, bedNumber: bed.bedNumber, floor: room.floor });
      });
    });
    return map;
  }, [roomsWithBeds]);

  const tenantsWithRooms = useMemo<Tenant[]>(() => {
    if (!tenants) return [];
    return tenants.map((t) => {
      const mapped = bedMap.get(t.bedId);
      return {
        ...t,
        roomNumber: mapped?.roomNumber,
        floor: mapped?.floor,
        bedNumber: mapped?.bedNumber,
      };
    });
  }, [tenants, bedMap]);

  const filtered = useMemo(() => {
    if (!tenantsWithRooms.length) return [];
    if (!search.trim()) return tenantsWithRooms;
    const q = search.toLowerCase();
    return tenantsWithRooms.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        (t.roomNumber && t.roomNumber.toLowerCase().includes(q)) ||
        (t.bedNumber && t.bedNumber.toLowerCase().includes(q))
    );
  }, [tenantsWithRooms, search]);

  const OVERVIEW_ITEMS = useMemo(
    () => [
      {
        label: 'Active Tenants',
        value: String(pgSummary?.activeTenants ?? 0),
        icon: 'people' as const,
        color: theme.colors.success,
        bg: theme.colors.successSurface,
      },
      {
        label: 'Left Tenants',
        value: String(pgSummary?.leftTenants ?? 0),
        icon: 'person-remove' as const,
        color: theme.colors.textTertiary,
        bg: theme.colors.backgroundSecondary,
      },
      {
        label: 'Collected',
        value: `₹${Math.round(pgSummary?.monthlyRevenue ?? 0).toLocaleString()}`,
        icon: 'cash' as const,
        color: theme.colors.success,
        bg: theme.colors.successSurface,
      },
      {
        label: 'Pending',
        value: `₹${Math.round(pgSummary?.pendingDues ?? 0).toLocaleString()}`,
        icon: 'time' as const,
        color: theme.colors.warning,
        bg: theme.colors.warningSurface,
      },
    ],
    [pgSummary, theme]
  );

  const isLoading = tenantsLoading || roomsLoading;

  const getStatusChip = (status: Tenant['status']) => {
    const isActive = status === 'ACTIVE';
    return (
      <View
        style={{
          backgroundColor: isActive ? theme.colors.successSurface : theme.colors.backgroundSecondary,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 4,
          borderRadius: theme.radius.full,
        }}
      >
        <Typography variant="caption" color={isActive ? theme.colors.success : theme.colors.textTertiary} style={{ fontWeight: '600' }}>
          {status}
        </Typography>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: HEADER_IMAGE }}
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
                  <Avatar size={44} uri="" name={selectedPg?.name || user?.name} />
                </TouchableOpacity>
                <View style={{ marginLeft: theme.spacing.sm }}>
                  <PgSelector />
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(ROUTES.SCREENS.NOTIFICATIONS)}
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
            <SearchBar placeholder="Search tenants by name, room or bed" value={search} onChangeText={setSearch} />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: theme.spacing.sm }}>
              {OVERVIEW_ITEMS.map((item) => (
                <Card key={item.label} shadow="sm" padding={theme.spacing.md} style={{ width: '48%', marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={item.icon} size={22} color={item.color} />
                    </View>
                    <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                      <Typography variant="caption" color={theme.colors.textMuted}>{item.label}</Typography>
                      <Typography variant="title2" color={item.color}>{item.value}</Typography>
                    </View>
                  </View>
                </Card>
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

            {!isLoading && filtered.map((tenant) => (
              <TouchableOpacity
                key={tenant.id}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: ROUTES.SCREENS.TENANTS_PROFILE, params: { id: tenant.id } })}
              >
                <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar uri="" name={tenant.fullName} size={56} />
                    <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                      <Typography variant="title3">{tenant.fullName}</Typography>
                      <Typography variant="caption" color={theme.colors.textMuted}>{tenant.phone}</Typography>
                      <Typography variant="bodyMedium" color={theme.colors.primary}>
                        Room {tenant.roomNumber || '-'} • Bed {tenant.bedNumber || '-'}
                      </Typography>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      {getStatusChip(tenant.status)}
                      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }} />
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>

      </View>
    </ScreenWrapper>
  );
}
