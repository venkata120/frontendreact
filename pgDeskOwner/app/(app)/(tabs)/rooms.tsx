import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, HeroHeader } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useRoomsWithBeds, useFloorsByPg, useDeleteRoom } from '../../../src/hooks/queries';
import { confirmAction } from '../../../src/utils/uiHelpers';
import type { Room, Bed } from '../../../src/types';

type StatKey = 'available' | 'occupied' | 'notice' | 'prebooking';

const STAT_CONFIG: Record<
  StatKey,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  available: { label: 'Available Beds', icon: 'bed', color: '#EF4444', bg: '#FEE2E2' },
  occupied: { label: 'Occupied Beds', icon: 'bed', color: '#22C55E', bg: '#DCFCE7' },
  notice: { label: 'Notice Beds', icon: 'alert-circle', color: '#F59E0B', bg: '#FEF3C7' },
  prebooking: { label: 'Pre Booking', icon: 'calendar', color: '#8B5CF6', bg: '#EDE9FE' },
};

export default function RoomsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const deleteRoom = useDeleteRoom();

  const { data: roomsWithBeds, isLoading } = useRoomsWithBeds(selectedPg?.id);
  const { data: floors } = useFloorsByPg(selectedPg?.id);
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');

  const stats = useMemo(() => {
    if (!roomsWithBeds) return { available: 0, occupied: 0, notice: 0, prebooking: 0, total: 0 };
    let total = 0;
    let occupied = 0;
    roomsWithBeds.forEach((room) => {
      const beds = room.beds || [];
      total += beds.length || room.capacity;
      occupied += beds.filter((b) => b.status === 'OCCUPIED').length;
    });
    return {
      available: total - occupied,
      occupied,
      notice: 0,
      prebooking: 0,
      total,
    };
  }, [roomsWithBeds]);

  const filteredRooms = useMemo(() => {
    if (!roomsWithBeds) return [];
    if (activeFilter === 'all') return roomsWithBeds;
    return roomsWithBeds.filter((room) => room.floor === activeFilter);
  }, [roomsWithBeds, activeFilter]);

  const roomsByFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    filteredRooms.forEach((room) => {
      const floor = room.floor ?? 0;
      if (!map.has(floor)) map.set(floor, []);
      map.get(floor)!.push(room);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [filteredRooms]);

  const floorChips = useMemo(() => {
    const list = floors ?? [];
    return ['all', ...list.sort((a, b) => a - b)] as const;
  }, [floors]);

  const navigateToCategory = (key: StatKey) => {
    router.push({
      pathname: '/screens/bed-category',
      params: { status: key, title: STAT_CONFIG[key].label, color: STAT_CONFIG[key].color },
    } as any);
  };

  const navigateToBed = (bed: Bed, room: Room) => {
    router.push({
      pathname: '/screens/bed-details',
      params: { bedId: bed.id, roomId: room.id },
    } as any);
  };

  return (
    <ScreenWrapper edges={["bottom", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroHeader
          avatarUri=""
          avatarName={user?.name}
          onAvatarPress={openDrawer}
          onNotificationPress={() => router.push('/screens/notifications' as any)}
          showCount={true}
          height={220}
        />

        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base }}>
          {/* Total rooms */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Ionicons name="business-outline" size={20} color={theme.colors.text} style={{ marginRight: 6 }} />
            <Typography variant="title1">Total Rooms : {roomsWithBeds?.length ?? 0}</Typography>
          </View>

          {/* Stat cards */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            {(Object.keys(STAT_CONFIG) as StatKey[]).map((key) => {
              const cfg = STAT_CONFIG[key];
              return (
                <Card
                  key={key}
                  shadow="sm"
                  padding={theme.spacing.md}
                  style={{ width: '48%', marginBottom: theme.spacing.md }}
                >
                  <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToCategory(key)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: cfg.bg,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                        </View>
                        <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                          <Typography variant="caption" color={theme.colors.textMuted}>
                            {cfg.label}
                          </Typography>
                          <Typography variant="title2" color={cfg.color}>
                            {String(stats[key])}
                          </Typography>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>

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
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.backgroundSecondary,
                    marginRight: theme.spacing.sm,
                    borderWidth: 1,
                    borderColor: isActive ? theme.colors.primary : theme.colors.borderLight,
                  }}
                >
                  <Typography variant="bodyMedium" color={isActive ? theme.colors.white : theme.colors.text}>
                    {label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Room list grouped by floor */}
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderTopLeftRadius: theme.radius['2xl'],
              borderTopRightRadius: theme.radius['2xl'],
              paddingHorizontal: theme.spacing.base,
              paddingTop: theme.spacing.base,
              minHeight: 300,
            }}
          >
            {isLoading && (
              <Typography variant="body" color={theme.colors.textMuted} style={{ paddingVertical: theme.spacing.xl }}>
                Loading rooms...
              </Typography>
            )}

            {!isLoading && filteredRooms.length === 0 && (
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
                  <Ionicons name="bed-outline" size={48} color={theme.colors.textMuted} />
                </View>
                <Typography variant="title1">Nothing found</Typography>
                <Typography variant="body" color={theme.colors.textMuted}>
                  No rooms added yet.
                </Typography>
              </View>
            )}

            {!isLoading &&
              roomsByFloor.map(([floor, rooms]) => (
                <View key={floor} style={{ marginBottom: theme.spacing.md }}>
                  <Typography variant="bodyMedium" color={theme.colors.primary} style={{ marginBottom: theme.spacing.sm }}>
                    Floor {floor}
                  </Typography>
                  {rooms.map((room) => {
                    const beds = room.beds || [];
                    const occupied = beds.filter((b) => b.status === 'OCCUPIED').length;
                    const total = beds.length || room.capacity;
                    return (
                      <Card key={room.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                          <View style={{ flex: 1, paddingRight: theme.spacing.sm }}>
                            <Typography variant="title2">Room {room.roomNumber}</Typography>
                            <Typography variant="caption" color={theme.colors.textMuted}>
                              {occupied}/{total} beds occupied
                            </Typography>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => router.push({ pathname: '/(app)/edit-room' as any, params: { id: room.id } })}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: theme.colors.successSurface,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: theme.spacing.sm,
                              }}
                            >
                              <Ionicons name="create-outline" size={16} color={theme.colors.success} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() =>
                                confirmAction(
                                  'Delete Room',
                                  'Are you sure you want to delete this room?',
                                  () => deleteRoom.mutate(room.id),
                                  'Delete'
                                )
                              }
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: theme.colors.dangerSurface,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {beds.map((bed) => {
                            const isOccupied = bed.status === 'OCCUPIED';
                            return (
                              <TouchableOpacity
                                key={bed.id}
                                activeOpacity={0.8}
                                onPress={() => navigateToBed(bed, room)}
                                style={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: theme.radius.md,
                                  backgroundColor: isOccupied ? '#DCFCE7' : '#FEE2E2',
                                  borderWidth: 1,
                                  borderColor: isOccupied ? '#22C55E' : '#EF4444',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Ionicons name="bed" size={18} color={isOccupied ? '#22C55E' : '#EF4444'} />
                                <Typography variant="caption" color={isOccupied ? '#22C55E' : '#EF4444'}>
                                  {bed.bedNumber}
                                </Typography>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </Card>
                    );
                  })}
                </View>
              ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/(app)/add-room')}
        style={{
          position: 'absolute',
          right: theme.spacing.base,
          bottom: insets.bottom + 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          ...theme.shadows.md,
        }}
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.white} />
        <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
          Add Room
        </Typography>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
