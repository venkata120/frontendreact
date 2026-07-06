import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card, Button, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useRoom, useBedsByRoom } from '../../src/hooks/queries';
import { useTenantByBed } from '../../src/hooks/queries/useTenants';

const STATUS_COLORS = {
  VACANT: { color: '#EF4444', bg: '#FEE2E2', label: 'Available' },
  OCCUPIED: { color: '#22C55E', bg: '#DCFCE7', label: 'Occupied' },
};

export default function BedDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPg } = useSelectedPg();
  const { bedId, roomId } = useLocalSearchParams<{ bedId: string; roomId: string }>();

  const { data: room, isLoading: roomLoading } = useRoom(roomId);
  const { data: beds } = useBedsByRoom(roomId);
  const { data: tenant } = useTenantByBed(bedId);

  const bed = beds?.find((b) => b.id === bedId);
  const status = bed?.status === 'OCCUPIED' ? 'OCCUPIED' : 'VACANT';
  const statusMeta = STATUS_COLORS[status];
  const isOccupied = status === 'OCCUPIED';

  const handleAddTenant = () => {
    if (!selectedPg?.id) return;
    router.push({ pathname: '/screens/add-tenant', params: { pgId: selectedPg.id } } as any);
  };

  const handlePreBook = () => {
    Alert.alert('Coming soon', 'Pre-booking will be available in a future update.');
  };

  const handleViewProfile = () => {
    if (tenant?.id) {
      router.push({ pathname: '/screens/tenants-profile', params: { id: tenant.id } } as any);
    }
  };

  if (roomLoading || !bed) {
    return (
      <ScreenWrapper>
        <Header title="Bed Details" onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body" color={theme.colors.textMuted}>
            Loading bed details...
          </Typography>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header title="Bed Details" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          <Card shadow="lg" padding={theme.spacing.lg}>
            {/* Bed visual */}
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: theme.radius.xl,
                  backgroundColor: statusMeta.bg,
                  borderWidth: 1,
                  borderColor: statusMeta.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.sm,
                }}
              >
                <Ionicons name="bed" size={36} color={statusMeta.color} />
              </View>
              <Typography variant="title1">Bed {bed.bedNumber}</Typography>
              <Typography variant="body" color={theme.colors.textMuted}>
                Room {room?.roomNumber}
              </Typography>
            </View>

            {/* Detail rows */}
            <DetailRow icon="layers-outline" label="Floor No" value={String(room?.floor ?? 0)} />
            <DetailRow icon="business-outline" label="Room No" value={room?.roomNumber ?? '-'} />
            <DetailRow icon="bed-outline" label="Bed No" value={bed.bedNumber} />
            <DetailRow
              icon="information-circle-outline"
              label="Status"
              value={statusMeta.label}
              valueColor={statusMeta.color}
            />
            <DetailRow icon="people-outline" label="Room Capacity" value={`${room?.capacity ?? 0} Beds`} />
            <DetailRow icon="cash-outline" label="Base Rent" value="₹10,000" />
          </Card>

          {/* Occupied tenant card */}
          {isOccupied && tenant && (
            <Card shadow="md" padding={theme.spacing.lg} style={{ marginTop: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar size={56} uri="" name={tenant.fullName} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                  <Typography variant="title2">{tenant.fullName}</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {tenant.phone}
                  </Typography>
                </View>
              </View>
              <View style={{ marginTop: theme.spacing.md }}>
                <Button title="View Profile" variant="outline" onPress={handleViewProfile} />
              </View>
            </Card>
          )}

          {/* Action buttons */}
          {!isOccupied && (
            <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
              <Button title="Add Tenant" leftIcon={<Ionicons name="person-add" size={18} color={theme.colors.white} />} onPress={handleAddTenant} />
              <Button
                title="Pre-Book"
                variant="outline"
                leftIcon={<Ionicons name="calendar" size={18} color={theme.colors.primary} />}
                onPress={handlePreBook}
              />
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} style={{ marginRight: 10 }} />
        <Typography variant="bodyMedium" color={theme.colors.textMuted}>
          {label}
        </Typography>
      </View>
      <Typography variant="bodyMedium" color={valueColor || theme.colors.text}>
        {value}
      </Typography>
    </View>
  );
}
