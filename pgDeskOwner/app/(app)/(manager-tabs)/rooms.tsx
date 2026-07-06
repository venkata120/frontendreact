import { useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar, PgSelector } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useRoomsWithBeds } from '../../../src/hooks/queries';
import type { Room } from '../../../src/types';

const HEADER_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

export default function ManagerRoomsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();

  const { data: roomsWithBeds, isLoading, refetch: refetchRooms } = useRoomsWithBeds(selectedPg?.id);

  useFocusEffect(
    useCallback(() => {
      if (selectedPg?.id) {
        refetchRooms();
        qc.refetchQueries({ queryKey: ['rooms', 'pg', selectedPg.id] });
      }
    }, [refetchRooms, qc, selectedPg?.id])
  );

  const stats = useMemo(() => {
    if (!roomsWithBeds) return { available: 0, occupied: 0, notice: 0, preBooking: 0, total: 0 };
    let total = 0;
    let occupied = 0;
    roomsWithBeds.forEach((room) => {
      const beds = room.beds || [];
      total += beds.length || room.capacity;
      occupied += beds.filter((b) => b.status === 'OCCUPIED').length;
    });
    return { available: total - occupied, occupied, notice: 0, preBooking: 0, total };
  }, [roomsWithBeds]);

  const groupedRooms = useMemo(() => {
    const map = new Map<number, Room[]>();
    roomsWithBeds?.forEach((room) => {
      const floor = room.floor ?? 0;
      const list = map.get(floor) || [];
      list.push(room);
      map.set(floor, list);
    });
    Array.from(map.values()).forEach((list) => list.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)));
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [roomsWithBeds]);

  const STATS = [
    { label: 'Available Beds', value: String(stats.available), icon: 'bed' as const, color: theme.colors.danger, bg: theme.colors.dangerSurface },
    { label: 'Occupied Beds', value: String(stats.occupied), icon: 'bed' as const, color: theme.colors.success, bg: theme.colors.successSurface },
    { label: 'Notice Beds', value: String(stats.notice), icon: 'alert-circle' as const, color: theme.colors.warning, bg: theme.colors.warningSurface },
    { label: 'Pre Booking', value: String(stats.preBooking), icon: 'calendar' as const, color: theme.colors.info, bg: theme.colors.primarySurface },
  ];

  const renderRoomCard = (room: Room) => {
    const beds = room.beds || [];
    const occupied = beds.filter((b) => b.status === 'OCCUPIED').length;
    const total = beds.length || room.capacity;
    const vacant = total - occupied;
    return (
      <TouchableOpacity
        key={room.id}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/(app)/edit-room' as any, params: { id: room.id } })}
      >
        <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Typography variant="title2">Room {room.roomNumber}</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>Capacity {room.capacity}</Typography>
              <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.md }}>
                  <Ionicons name="bed" size={14} color={theme.colors.success} />
                  <Typography variant="caption" color={theme.colors.success} style={{ marginLeft: 4, fontWeight: '600' }}>
                    {occupied} Occupied
                  </Typography>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="bed-outline" size={14} color={theme.colors.danger} />
                  <Typography variant="caption" color={theme.colors.danger} style={{ marginLeft: 4, fontWeight: '600' }}>
                    {vacant} Vacant
                  </Typography>
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Typography variant="caption" color={theme.colors.textMuted}>Beds</Typography>
              <Typography variant="title2">{occupied}/{total}</Typography>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} style={{ marginTop: theme.spacing.xs }} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

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
                <Avatar size={44} uri="" name={selectedPg?.name || user?.name} />
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
              <Card key={s.label} shadow="sm" padding={theme.spacing.md} style={{ width: '48%', marginBottom: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: s.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={s.icon} size={22} color={s.color} />
                  </View>
                  <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                    <Typography variant="caption" color={theme.colors.textMuted}>{s.label}</Typography>
                    <Typography variant="title2" color={s.color}>{s.value}</Typography>
                  </View>
                </View>
              </Card>
            ))}
          </View>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading rooms...</Typography>}

          {!isLoading && groupedRooms.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg }}>
                <Ionicons name="bed-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <Typography variant="title1">Nothing found</Typography>
              <Typography variant="body" color={theme.colors.textMuted}>No rooms added yet.</Typography>
            </View>
          )}

          {!isLoading && groupedRooms.map(([floor, rooms]) => (
            <View key={floor} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <Ionicons name="layers-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Typography variant="title2" color={theme.colors.primary}>Floor {floor}</Typography>
              </View>
              {rooms.map(renderRoomCard)}
            </View>
          ))}
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>

    </ScreenWrapper>
  );
}
