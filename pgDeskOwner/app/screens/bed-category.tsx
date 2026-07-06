import { useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useRoomsWithBeds, useFloorsByPg, useTenantsByPg } from '../../src/hooks/queries';
import type { Room, Bed } from '../../src/types';

type StatusKey = 'available' | 'occupied' | 'notice' | 'prebooking';

const EMPTY_CONFIG: Record<StatusKey, { title: string; message: string }> = {
  available: {
    title: 'No Available Beds Found',
    message: 'No beds available right now.',
  },
  occupied: {
    title: 'No Occupied Beds Found',
    message: 'No beds occupied right now.',
  },
  notice: {
    title: 'No notice Beds',
    message: 'All rooms looks good..! No beds under maintenance',
  },
  prebooking: {
    title: 'No Beds available for pre-booking',
    message: 'No advance bookings right now.',
  },
};

export default function BedCategoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPg } = useSelectedPg();
  const { status, title, color } = useLocalSearchParams<{
    status: StatusKey;
    title: string;
    color: string;
  }>();

  const statusKey = (status || 'available') as StatusKey;
  const headerTitle = title || EMPTY_CONFIG[statusKey].title;
  const headerColor = color || theme.colors.primary;

  const { data: roomsWithBeds, isLoading, refetch } = useRoomsWithBeds(selectedPg?.id);
  const { data: floors } = useFloorsByPg(selectedPg?.id);
  const { data: tenants } = useTenantsByPg(selectedPg?.id);

  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');

  const tenantByBed = useMemo(() => {
    const map = new Map<string, { name: string; id: string }>();
    tenants?.forEach((t) => {
      if (t.bedId && t.status === 'ACTIVE') {
        map.set(t.bedId, { name: t.fullName, id: t.id });
      }
    });
    return map;
  }, [tenants]);

  const filteredBeds = useMemo(() => {
    if (!roomsWithBeds) return [] as { room: Room; bed: Bed }[];

    const list: { room: Room; bed: Bed }[] = [];
    roomsWithBeds.forEach((room) => {
      if (activeFilter !== 'all' && room.floor !== activeFilter) return;
      (room.beds || []).forEach((bed) => {
        if (statusKey === 'available' && bed.status === 'VACANT') list.push({ room, bed });
        if (statusKey === 'occupied' && bed.status === 'OCCUPIED') list.push({ room, bed });
      });
    });
    return list;
  }, [roomsWithBeds, statusKey, activeFilter]);

  const bedsByFloor = useMemo(() => {
    const map = new Map<number, { room: Room; bed: Bed }[]>();
    filteredBeds.forEach((item) => {
      const floor = item.room.floor ?? 0;
      if (!map.has(floor)) map.set(floor, []);
      map.get(floor)!.push(item);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [filteredBeds]);

  const floorChips = useMemo(() => {
    const list = floors ?? [];
    return ['all', ...list.sort((a, b) => a - b)] as const;
  }, [floors]);

  const navigateToBed = (bed: Bed, room: Room) => {
    router.push({ pathname: '/screens/bed-details', params: { bedId: bed.id, roomId: room.id } } as any);
  };

  const showEmpty = !isLoading && filteredBeds.length === 0;

  return (
    <ScreenWrapper>
      <Header
        title={headerTitle}
        onBack={() => router.back()}
        backgroundColor={headerColor}
        textColor={theme.colors.white}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          {/* Floor filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.md }}>
            {floorChips.map((chip) => {
              const isActive = activeFilter === chip;
              const label = chip === 'all' ? 'All' : `Floor ${chip}`;
              return (
                <TouchableOpacity
                  key={String(chip)}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(chip)}
                  style={{
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.radius.full,
                    backgroundColor: isActive ? headerColor : theme.colors.backgroundSecondary,
                    marginRight: theme.spacing.sm,
                    borderWidth: 1,
                    borderColor: isActive ? headerColor : theme.colors.borderLight,
                  }}
                >
                  <Typography variant="bodyMedium" color={isActive ? theme.colors.white : theme.colors.text}>
                    {label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Empty state */}
          {showEmpty && (
            <Card shadow="md" padding={theme.spacing.xl} style={{ alignItems: 'center', marginTop: theme.spacing.lg }}>
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: theme.colors.primarySurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Ionicons name="bed-outline" size={64} color={theme.colors.primary} />
              </View>
              <Typography variant="title1" style={{ marginBottom: theme.spacing.sm }}>
                {EMPTY_CONFIG[statusKey].title}
              </Typography>
              <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginBottom: theme.spacing.lg }}>
                {EMPTY_CONFIG[statusKey].message}
              </Typography>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => refetch()}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.primary,
                  paddingVertical: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.lg,
                  borderRadius: theme.radius.full,
                }}
              >
                <Ionicons name="refresh" size={16} color={theme.colors.white} style={{ marginRight: 6 }} />
                <Typography variant="bodyMedium" color={theme.colors.white}>
                  Refresh
                </Typography>
              </TouchableOpacity>
            </Card>
          )}

          {/* Floor sections */}
          {!isLoading &&
            bedsByFloor.map(([floor, items]) => (
              <View key={floor} style={{ marginBottom: theme.spacing.md }}>
                <Typography variant="bodyMedium" color={theme.colors.primary} style={{ marginBottom: theme.spacing.sm }}>
                  Floor {floor}
                </Typography>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {items.map(({ room, bed }) => {
                    const tenant = tenantByBed.get(bed.id);
                    const isOccupied = bed.status === 'OCCUPIED';
                    return (
                      <TouchableOpacity
                        key={bed.id}
                        activeOpacity={0.8}
                        onPress={() => navigateToBed(bed, room)}
                        style={{
                          width: 72,
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: theme.radius.lg,
                            backgroundColor: isOccupied ? '#DCFCE7' : '#FEE2E2',
                            borderWidth: 1,
                            borderColor: isOccupied ? '#22C55E' : '#EF4444',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 4,
                          }}
                        >
                          <Ionicons name="bed" size={24} color={isOccupied ? '#22C55E' : '#EF4444'} />
                          <Typography variant="caption" color={isOccupied ? '#22C55E' : '#EF4444'}>
                            {bed.bedNumber}
                          </Typography>
                        </View>
                        <Typography variant="caption" color={theme.colors.textMuted} align="center">
                          Room {room.roomNumber}
                        </Typography>
                        {tenant && (
                          <Typography variant="caption" color={theme.colors.text} align="center" numberOfLines={1}>
                            {tenant.name}
                          </Typography>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}
