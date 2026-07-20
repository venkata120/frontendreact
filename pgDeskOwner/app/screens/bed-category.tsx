import { useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card, Avatar, Button, Badge, SuccessModal, ConfirmDialog } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useRoomsWithBeds, useFloorsByPg, useTenantsByPg } from '../../src/hooks/queries';
import type { Room, Bed } from '../../src/types';

type StatusKey = 'available' | 'occupied' | 'notice' | 'prebooking';

const EMPTY_CONFIG: Record<StatusKey, { title: string; message: string; icon: keyof typeof Ionicons.glyphMap }> = {
  available: {
    title: 'No Available Beds',
    message: 'All beds are currently occupied or under maintenance. Add a room or check back later.',
    icon: 'bed-outline',
  },
  occupied: {
    title: 'No Occupied Beds',
    message: 'No tenants have been assigned to beds yet. Add a tenant to a bed to see it here.',
    icon: 'people-outline',
  },
  notice: {
    title: 'No Notice Beds',
    message: 'Notice beds are not supported by the backend yet. Use the demo below to preview the flow.',
    icon: 'notifications-outline',
  },
  prebooking: {
    title: 'No Pre-Bookings',
    message: 'No beds have been pre-booked. Pre-book a vacant bed to see it here.',
    icon: 'calendar-outline',
  },
};

// Demo notice-bed tenant used while backend notice support is missing
const DEMO_NOTICE_TENANT = {
  id: 'demo-notice-tenant',
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  room: '101',
  bed: 'B',
  noticeDate: '30 Jun 2026',
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

  // Notice flow placeholder state
  const [noticeProfileVisible, setNoticeProfileVisible] = useState(false);
  const [noticeConfirmVisible, setNoticeConfirmVisible] = useState(false);
  const [noticeSuccessVisible, setNoticeSuccessVisible] = useState(false);

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
  const showNoticeDemo = showEmpty && statusKey === 'notice';

  const handleMarkVacated = () => {
    setNoticeProfileVisible(false);
    setNoticeConfirmVisible(true);
  };

  const confirmVacate = () => {
    setNoticeConfirmVisible(false);
    setNoticeSuccessVisible(true);
  };

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
          {/* Room occupancy summary */}
          <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="bed-outline" size={20} color={headerColor} style={{ marginRight: 8 }} />
                <Typography variant="bodyMedium">Total Beds</Typography>
              </View>
              <Typography variant="title2" color={headerColor}>{filteredBeds.length}</Typography>
            </View>
          </Card>

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
                <Ionicons name={EMPTY_CONFIG[statusKey].icon} size={64} color={theme.colors.primary} />
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

          {/* Notice beds placeholder demo */}
          {showNoticeDemo && (
            <Card shadow="md" padding={theme.spacing.lg} style={{ marginTop: theme.spacing.lg, backgroundColor: theme.colors.warningSurface }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Ionicons name="notifications-outline" size={24} color={theme.colors.warning} style={{ marginRight: 8 }} />
                <Typography variant="title2" color={theme.colors.text}>
                  Notice Bed Preview
                </Typography>
              </View>
              <Typography variant="body" color={theme.colors.textTertiary} style={{ marginBottom: theme.spacing.md }}>
                This is a placeholder for the notice-bed flow. The backend does not yet expose beds under notice.
              </Typography>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setNoticeProfileVisible(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.lg,
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: theme.colors.borderLight,
                }}
              >
                <Avatar size={48} name={DEMO_NOTICE_TENANT.name} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                    {DEMO_NOTICE_TENANT.name}
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    Room {DEMO_NOTICE_TENANT.room} · Bed {DEMO_NOTICE_TENANT.bed}
                  </Typography>
                  <View style={{ marginTop: 4 }}>
                    <Badge label="Notice Period" variant="warning" />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
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

      {/* Notice tenant profile popup */}
      <Modal visible={noticeProfileVisible} transparent animationType="fade" onRequestClose={() => setNoticeProfileVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay, padding: theme.spacing.lg }}>
          <View style={{ backgroundColor: theme.colors.background, borderRadius: theme.radius['2xl'], padding: theme.spacing.xl, width: '100%' }}>
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Avatar size={80} name={DEMO_NOTICE_TENANT.name} />
              <Typography variant="title1" style={{ marginTop: theme.spacing.sm }}>
                {DEMO_NOTICE_TENANT.name}
              </Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                {DEMO_NOTICE_TENANT.phone}
              </Typography>
              <View style={{ marginTop: theme.spacing.sm }}>
                <Badge label="Notice Period" variant="warning" />
              </View>
            </View>
            <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Room {DEMO_NOTICE_TENANT.room} · Bed {DEMO_NOTICE_TENANT.bed}
              </Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Notice until: {DEMO_NOTICE_TENANT.noticeDate}
              </Typography>
            </Card>
            <Button
              title="Mark Vacated"
              variant="danger"
              leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.white} />}
              onPress={handleMarkVacated}
            />
            <View style={{ marginTop: theme.spacing.md }}>
              <Button title="Close" variant="outline" onPress={() => setNoticeProfileVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={noticeConfirmVisible}
        title="Mark Vacated"
        message={`Are you sure you want to mark ${DEMO_NOTICE_TENANT.name}'s bed as vacated?`}
        confirmText="Vacate"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmVacate}
        onCancel={() => setNoticeConfirmVisible(false)}
      />

      <SuccessModal
        visible={noticeSuccessVisible}
        icon="checkmark-circle"
        title="Bed Vacated"
        message="The notice bed has been marked as vacated successfully."
        primaryButton={{
          title: 'Done',
          onPress: () => setNoticeSuccessVisible(false),
        }}
        onClose={() => setNoticeSuccessVisible(false)}
      />
    </ScreenWrapper>
  );
}
