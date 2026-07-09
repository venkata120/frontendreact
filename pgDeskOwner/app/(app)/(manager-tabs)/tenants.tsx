import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Typography,
  SearchBar,
  HeroHeader,
  TenantListItem,
  TenantOverviewCard,
  FilterSheet,
} from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useDashboardOverview, useTenantsByPg, useRoomsWithBeds } from '../../../src/hooks/queries';
import { ROUTES } from '../../../src/constants';
import type { Tenant } from '../../../src/types';

export default function ManagerTenantsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();
  const managerId = user?.id;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXITED'>('ALL');
  const [filterOpen, setFilterOpen] = useState(false);

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
      return { ...t, roomNumber: mapped?.roomNumber, floor: mapped?.floor, bedNumber: mapped?.bedNumber };
    });
  }, [tenants, bedMap]);

  const filtered = useMemo(() => {
    let result = tenantsWithRooms;
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.phone.includes(q) ||
        (t.roomNumber && t.roomNumber.toLowerCase().includes(q)) ||
        (t.bedNumber && t.bedNumber.toLowerCase().includes(q))
    );
  }, [tenantsWithRooms, search, statusFilter]);

  const overviewItems = useMemo(
    () => [
      {
        label: 'Active Tenants',
        value: String(pgSummary?.activeTenants ?? 0),
        icon: 'people' as const,
        color: theme.colors.accentPurple,
        bg: '#F3E8FF',
        route: ROUTES.APP.TENANTS,
      },
      {
        label: 'Left Tenants',
        value: String(pgSummary?.leftTenants ?? 0),
        icon: 'person-remove' as const,
        color: '#0A2A5E',
        bg: '#E7ECF3',
        route: ROUTES.SCREENS.LEFT_TENANTS_PROFILE,
      },
      {
        label: 'Collected',
        value: `₹${Math.round(pgSummary?.monthlyRevenue ?? 0).toLocaleString()}`,
        icon: 'cash' as const,
        color: theme.colors.success,
        bg: theme.colors.successSurface,
        route: ROUTES.SCREENS.COLLECTED_AMOUNT,
      },
      {
        label: 'Pending',
        value: `₹${Math.round(pgSummary?.pendingDues ?? 0).toLocaleString()}`,
        icon: 'time' as const,
        color: theme.colors.warning,
        bg: theme.colors.warningSurface,
        route: ROUTES.SCREENS.PENDING_DUES,
      },
    ],
    [pgSummary, theme]
  );

  const isLoading = tenantsLoading || roomsLoading;

  return (
    <ScreenWrapper edges={["bottom", "left", "right"]}>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <HeroHeader
            avatarUri={user?.avatar}
            avatarName={selectedPg?.name || user?.name}
            onAvatarPress={openDrawer}
            onNotificationPress={() => router.push(ROUTES.SCREENS.NOTIFICATIONS as any)}
            showCount={false}
            height={220}
          />

          <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <SearchBar
                  placeholder="Search tenants by name, room or bed"
                  value={search}
                  onChangeText={setSearch}
                  style={{ marginHorizontal: 0, marginVertical: 0 }}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setFilterOpen(true)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: theme.radius.md,
                  backgroundColor: statusFilter !== 'ALL' ? theme.colors.primarySurface : theme.colors.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: statusFilter !== 'ALL' ? theme.colors.primary : theme.colors.border,
                }}
              >
                <Ionicons
                  name="options-outline"
                  size={22}
                  color={statusFilter !== 'ALL' ? theme.colors.primary : theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              {overviewItems.map((item) => (
                <TenantOverviewCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  color={item.color}
                  bg={item.bg}
                  onPress={() => router.push(item.route as any)}
                  style={{ width: '48%', marginBottom: theme.spacing.md }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="people" size={20} color={theme.colors.text} style={{ marginRight: 6 }} />
              <Typography variant="title1">All Tenants</Typography>
            </View>

            {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading tenants...</Typography>}

            {!isLoading && filtered.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: theme.colors.primarySurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
                </View>
                <Typography variant="title1">Nothing found</Typography>
                <Typography variant="body" color={theme.colors.textMuted}>
                  {search.trim() || statusFilter !== 'ALL' ? 'No tenants match your filters.' : 'No tenants available.'}
                </Typography>
              </View>
            )}

            {!isLoading &&
              filtered.map((tenant) => (
                <TenantListItem
                  key={tenant.id}
                  tenant={tenant}
                  variant={tenant.status === 'EXITED' ? 'left' : 'default'}
                  onPress={() => router.push({ pathname: ROUTES.SCREENS.TENANTS_PROFILE, params: { id: tenant.id } })}
                />
              ))}

            <View style={{ height: theme.spacing.xl }} />
          </View>
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/screens/add-tenant' as any, params: { pgId: selectedPg?.id } })}
          style={{
            position: 'absolute',
            bottom: insets.bottom + theme.spacing.md,
            right: theme.spacing.base,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Ionicons name="add" size={22} color={theme.colors.white} />
          <Typography
            variant="bodyMedium"
            color={theme.colors.white}
            style={{ marginLeft: theme.spacing.xs, fontWeight: '600' }}
          >
            Add Tenant
          </Typography>
        </TouchableOpacity>

        <FilterSheet
          visible={filterOpen}
          onClose={() => setFilterOpen(false)}
          title="Filter Tenants"
          selected={statusFilter}
          onSelect={(v) => setStatusFilter(v)}
          options={[
            { label: 'All Tenants', value: 'ALL', icon: 'people-outline' },
            { label: 'Active Tenants', value: 'ACTIVE', icon: 'people' },
            { label: 'Left Tenants', value: 'EXITED', icon: 'person-remove' },
          ]}
        />
      </View>
    </ScreenWrapper>
  );
}
