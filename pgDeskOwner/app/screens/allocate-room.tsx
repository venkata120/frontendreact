import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant, useRoomsWithBeds, useUpdateTenant } from '../../src/hooks/queries';
import type { Bed } from '../../src/types';

export default function AllocateRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const { data: tenant } = useTenant(tenantId);
  const { data: roomsWithBeds } = useRoomsWithBeds(tenant?.pgId);
  const updateTenant = useUpdateTenant();
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const onAllocate = async () => {
    if (!tenant || !selectedBed) return;
    await updateTenant.mutateAsync({ id: tenant.id, payload: { bedId: selectedBed.id } });
    router.back();
  };

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.secondary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: theme.spacing.md,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>Allocate Room</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <Avatar size={64} uri="" name={tenant?.fullName} />
            <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
              <Typography variant="title1">{tenant?.fullName}</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>{tenant?.phone}</Typography>
              <Typography variant="caption" color={theme.colors.primary}>PG: {tenant?.pgId?.slice(0, 8)}</Typography>
            </View>
          </View>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Select a Room & Bed</Typography>

          {roomsWithBeds?.map((room) => {
            const vacantBeds = (room.beds || []).filter((b) => b.status === 'VACANT');
            const isExpanded = selectedRoomId === room.id;
            return (
              <Card key={room.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <TouchableOpacity onPress={() => setSelectedRoomId(isExpanded ? null : room.id)}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Typography variant="title2">Room {room.roomNumber}</Typography>
                      <Typography variant="caption" color={theme.colors.textMuted}>Floor {room.floor} • {vacantBeds.length} vacant beds</Typography>
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={theme.colors.textMuted} />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.md, gap: theme.spacing.sm }}>
                    {vacantBeds.map((bed) => {
                      const selected = selectedBed?.id === bed.id;
                      return (
                        <TouchableOpacity
                          key={bed.id}
                          onPress={() => setSelectedBed(bed)}
                          style={{
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            borderRadius: theme.radius.md,
                            backgroundColor: selected ? theme.colors.primary : theme.colors.backgroundSecondary,
                            borderWidth: 1,
                            borderColor: selected ? theme.colors.primary : theme.colors.border,
                          }}
                        >
                          <Typography variant="bodyMedium" color={selected ? theme.colors.white : theme.colors.text}>
                            Bed {bed.bedNumber}
                          </Typography>
                        </TouchableOpacity>
                      );
                    })}
                    {vacantBeds.length === 0 && (
                      <Typography variant="caption" color={theme.colors.textMuted}>No vacant beds</Typography>
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Allocate Room"
          loading={updateTenant.isPending}
          disabled={!selectedBed}
          leftIcon={<Ionicons name="bed" size={18} color={theme.colors.white} />}
          onPress={onAllocate}
        />
      </View>
    </ScreenWrapper>
  );
}
