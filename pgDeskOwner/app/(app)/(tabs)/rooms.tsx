import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar, PgSelector } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useRoomsWithBeds, useDeleteRoom } from '../../../src/hooks/queries';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

type StatKey = 'available' | 'occupied' | 'notice' | 'prebooking';

export default function RoomsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const deleteRoom = useDeleteRoom();

  const { data: roomsWithBeds, isLoading } = useRoomsWithBeds(selectedPg?.id);

  const stats = useMemo(() => {
    if (!roomsWithBeds) return { available: 0, occupied: 0, total: 0 };
    let total = 0;
    let occupied = 0;
    roomsWithBeds.forEach((room) => {
      const beds = room.beds || [];
      total += beds.length || room.capacity;
      occupied += beds.filter((b) => b.status === 'OCCUPIED').length;
    });
    return { available: total - occupied, occupied, total };
  }, [roomsWithBeds]);

  const [expandedStats, setExpandedStats] = useState<Record<StatKey, boolean>>({
    available: false,
    occupied: false,
    notice: false,
    prebooking: false,
  });

  const toggleStat = (key: StatKey) => {
    setExpandedStats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const STATS: {
    key: StatKey;
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bg: string;
  }[] = [
    {
      key: 'available',
      label: 'Available Beds',
      value: String(stats.available),
      icon: 'bed',
      color: '#EF4444',
      bg: '#FEE2E2',
    },
    {
      key: 'occupied',
      label: 'Occupied Beds',
      value: String(stats.occupied),
      icon: 'bed',
      color: '#22C55E',
      bg: '#DCFCE7',
    },
    {
      key: 'notice',
      label: 'Notice Beds',
      value: '0',
      icon: 'alert-circle',
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
    {
      key: 'prebooking',
      label: 'Pre Booking',
      value: '0',
      icon: 'calendar',
      color: '#8B5CF6',
      bg: '#EDE9FE',
    },
  ];

  return (
    <ScreenWrapper>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Ionicons name="business-outline" size={20} color={theme.colors.text} style={{ marginRight: 6 }} />
            <Typography variant="title1">Total Rooms : {roomsWithBeds?.length ?? 0}</Typography>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            {STATS.map((s) => (
              <Card
                key={s.key}
                shadow="sm"
                padding={theme.spacing.md}
                style={{ width: '48%', marginBottom: theme.spacing.md }}
              >
                <TouchableOpacity activeOpacity={0.9} onPress={() => toggleStat(s.key)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor: s.bg,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name={s.icon} size={22} color={s.color} />
                      </View>
                      <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          {s.label}
                        </Typography>
                        <Typography variant="title2" color={s.color}>
                          {s.value}
                        </Typography>
                      </View>
                    </View>
                    <Ionicons
                      name={expandedStats[s.key] ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>

                {expandedStats[s.key] && (
                  <View style={{ marginTop: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      {s.key === 'available' && 'Beds currently available for allocation.'}
                      {s.key === 'occupied' && 'Beds currently occupied by tenants.'}
                      {s.key === 'notice' && 'Tenants who have submitted exit notice.'}
                      {s.key === 'prebooking' && 'Advance bookings for upcoming availability.'}
                    </Typography>
                  </View>
                )}
              </Card>
            ))}
          </View>

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

            {!isLoading && (roomsWithBeds?.length ?? 0) === 0 && (
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
              roomsWithBeds?.map((room) => {
                const beds = room.beds || [];
                const occupied = beds.filter((b) => b.status === 'OCCUPIED').length;
                const total = beds.length || room.capacity;
                return (
                  <Card key={room.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="title2">Room {room.roomNumber}</Typography>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          Floor {room.floor} • Capacity {room.capacity}
                        </Typography>
                        <Typography variant="bodyMedium" color={theme.colors.primary} style={{ marginTop: theme.spacing.xs }}>
                          {occupied} / {total} beds occupied
                        </Typography>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          Beds
                        </Typography>
                        <Typography variant="title2">
                          {occupied}/{total}
                        </Typography>
                        <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm }}>
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
                            onPress={() => deleteRoom.mutate(room.id)}
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
                    </View>
                  </Card>
                );
              })}
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
          bottom: insets.bottom,
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
