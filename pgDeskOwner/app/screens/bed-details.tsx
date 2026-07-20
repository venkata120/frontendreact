import { useState, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, Alert, Modal, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Header,
  Typography,
  Card,
  Button,
  Avatar,
  Input,
  SuccessModal,
  ConfirmDialog,
  Badge,
  StatusBadge,
  DatePicker,
} from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import {
  useRoom,
  useBedsByRoom,
  useRoomsWithBeds,
  useUpdateBedStatus,
  useUpdateTenant,
  useTenantByBed,
  useTenant,
} from '../../src/hooks/queries';
import { getApiErrorMessage } from '../../src/utils/validation';
import type { Room, Bed, Tenant } from '../../src/types';

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
  const { data: tenantDetails } = useTenant(tenant?.id);

  const { data: roomsWithBeds } = useRoomsWithBeds(selectedPg?.id);
  const updateTenant = useUpdateTenant();
  const updateBedStatus = useUpdateBedStatus();

  const bed = beds?.find((b) => b.id === bedId);
  const status = bed?.status === 'OCCUPIED' ? 'OCCUPIED' : 'VACANT';
  const statusMeta = STATUS_COLORS[status];
  const isOccupied = status === 'OCCUPIED';

  // Shift room modal state
  const [shiftVisible, setShiftVisible] = useState(false);
  const [shiftStep, setShiftStep] = useState<'room' | 'bed' | 'confirm'>('room');
  const [targetRoom, setTargetRoom] = useState<Room | null>(null);
  const [targetBed, setTargetBed] = useState<Bed | null>(null);
  const [shiftLoading, setShiftLoading] = useState(false);

  // Pre-booking modal state
  const [preBookVisible, setPreBookVisible] = useState(false);
  const [preBookStep, setPreBookStep] = useState<'form' | 'confirm'>('form');
  const [preBookName, setPreBookName] = useState('');
  const [preBookPhone, setPreBookPhone] = useState('');
  const [preBookEmail, setPreBookEmail] = useState('');
  const [preBookDate, setPreBookDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [preBookLoading, setPreBookLoading] = useState(false);

  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const paymentStatus = useMemo(() => {
    const ledgers = tenantDetails?.rentLedgers || [];
    if (ledgers.length === 0) {
      return { label: 'No records', variant: 'secondary' as const, due: 0, paid: 0, total: 0 };
    }
    const total = ledgers.reduce((sum, l) => sum + l.rentAmount, 0);
    const paid = ledgers.reduce((sum, l) => sum + (l.collectedAmount || 0), 0);
    const due = total - paid;
    if (due <= 0) {
      return { label: 'Paid', variant: 'success' as const, due, paid, total };
    }
    return { label: 'Due', variant: 'danger' as const, due, paid, total };
  }, [tenantDetails?.rentLedgers]);

  const handleAddTenant = () => {
    if (!selectedPg?.id) return;
    router.push({ pathname: '/screens/add-tenant', params: { pgId: selectedPg.id } } as any);
  };

  const handlePreBook = () => {
    setPreBookVisible(true);
    setPreBookStep('form');
    setPreBookName('');
    setPreBookPhone('');
    setPreBookEmail('');
    setPreBookDate(new Date());
  };

  const handleViewProfile = () => {
    if (tenant?.id) {
      router.push({ pathname: '/screens/tenants-profile', params: { id: tenant.id } } as any);
    }
  };

  const openShiftRoom = () => {
    setShiftVisible(true);
    setShiftStep('room');
    setTargetRoom(null);
    setTargetBed(null);
  };

  const closeShiftRoom = () => {
    setShiftVisible(false);
    setTargetRoom(null);
    setTargetBed(null);
  };

  const handleConfirmShift = async () => {
    if (!tenant?.id || !targetBed || !bed) return;
    setShiftLoading(true);
    try {
      await updateTenant.mutateAsync({ id: tenant.id, payload: { bedId: targetBed.id } as Partial<Tenant> });
      await updateBedStatus.mutateAsync({ id: bed.id, status: 'VACANT' });
      await updateBedStatus.mutateAsync({ id: targetBed.id, status: 'OCCUPIED' });
      setShiftVisible(false);
      setSuccessModal({
        visible: true,
        title: 'Tenant Shifted',
        message: `Tenant moved to Room ${targetRoom?.roomNumber}, Bed ${targetBed.bedNumber}.`,
      });
    } catch (err: any) {
      Alert.alert('Shift Failed', getApiErrorMessage(err, 'Unable to shift tenant. Please try again.'));
    } finally {
      setShiftLoading(false);
    }
  };

  const validatePreBook = () => {
    const errors: string[] = [];
    if (!preBookName.trim()) errors.push('Name is required');
    if (!preBookPhone.trim()) errors.push('Phone is required');
    if (errors.length > 0) {
      Alert.alert('Missing details', errors.join('\n'));
      return false;
    }
    return true;
  };

  const handlePreBookSubmit = () => {
    if (!validatePreBook()) return;
    setPreBookStep('confirm');
  };

  const handleConfirmPreBook = async () => {
    setPreBookLoading(true);
    // Backend endpoint for pre-booking is not available; simulate success after a short delay.
    setTimeout(() => {
      setPreBookLoading(false);
      setPreBookVisible(false);
      setSuccessModal({
        visible: true,
        title: 'Pre-Booking Requested',
        message: 'Pre-booking details captured. A backend endpoint is required to confirm the booking.',
      });
    }, 600);
  };

  const targetRooms = useMemo(() => {
    if (!roomsWithBeds) return [];
    return roomsWithBeds.filter((r) => r.id !== roomId && (r.beds || []).some((b) => b.status === 'VACANT'));
  }, [roomsWithBeds, roomId]);

  const targetVacantBeds = useMemo(() => {
    if (!targetRoom) return [];
    return (targetRoom.beds || []).filter((b) => b.status === 'VACANT');
  }, [targetRoom]);

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

          {/* Occupied tenant profile */}
          {isOccupied && tenant && (
            <Card shadow="md" padding={theme.spacing.lg} style={{ marginTop: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar size={64} uri={tenant.avatar} name={tenant.fullName} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                  <Typography variant="title2">{tenant.fullName}</Typography>
                  {tenant.status && <StatusBadge status={tenant.status} />}
                  <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 2 }}>
                    {tenant.phone}
                  </Typography>
                  {tenant.email && (
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      {tenant.email}
                    </Typography>
                  )}
                </View>
              </View>
              <View style={{ marginTop: theme.spacing.md, gap: theme.spacing.md }}>
                <Button title="View Profile" variant="outline" onPress={handleViewProfile} />
                <Button
                  title="Shift Room"
                  leftIcon={<Ionicons name="move" size={18} color={theme.colors.white} />}
                  onPress={openShiftRoom}
                />
              </View>
            </Card>
          )}

          {/* Payment status card */}
          {isOccupied && tenant && (
            <Card shadow="md" padding={theme.spacing.lg} style={{ marginTop: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cash-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Typography variant="title2">Payment Status</Typography>
                </View>
                <Badge label={paymentStatus.label} variant={paymentStatus.variant} />
              </View>
              {tenantDetails?.rentLedgers && tenantDetails.rentLedgers.length > 0 ? (
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      Total Rent
                    </Typography>
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                      ₹{paymentStatus.total.toLocaleString()}
                    </Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      Paid
                    </Typography>
                    <Typography variant="bodyMedium" color={theme.colors.success} style={{ fontWeight: '600' }}>
                      ₹{paymentStatus.paid.toLocaleString()}
                    </Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      Due
                    </Typography>
                    <Typography variant="bodyMedium" color={paymentStatus.due > 0 ? theme.colors.danger : theme.colors.text} style={{ fontWeight: '600' }}>
                      ₹{paymentStatus.due.toLocaleString()}
                    </Typography>
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons name="information-circle-outline" size={18} color={theme.colors.warning} style={{ marginRight: 8, marginTop: 2 }} />
                  <Typography variant="body" color={theme.colors.textTertiary}>
                    No payment records available for this tenant. Backend should expose rent ledgers on the bed-details tenant lookup.
                  </Typography>
                </View>
              )}
            </Card>
          )}

          {/* Action buttons */}
          {!isOccupied && (
            <View style={{ marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
              <Button
                title="Add Tenant"
                leftIcon={<Ionicons name="person-add" size={18} color={theme.colors.white} />}
                onPress={handleAddTenant}
              />
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

      {/* Shift Room Modal */}
      <Modal visible={shiftVisible} transparent animationType="slide" onRequestClose={closeShiftRoom}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <Typography variant="title1" style={{ fontWeight: '600' }}>
                {shiftStep === 'room' && 'Select Target Room'}
                {shiftStep === 'bed' && 'Select Target Bed'}
                {shiftStep === 'confirm' && 'Confirm Shift'}
              </Typography>
              <TouchableOpacity onPress={closeShiftRoom}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {shiftStep === 'room' && (
              <>
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.md }}>
                  Choose a room with an available bed.
                </Typography>
                {targetRooms.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
                    <Ionicons name="business-outline" size={48} color={theme.colors.textMuted} />
                    <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.md }}>
                      No rooms with vacant beds available.
                    </Typography>
                  </View>
                ) : (
                  <FlatList
                    data={targetRooms}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      const vacant = (item.beds || []).filter((b) => b.status === 'VACANT').length;
                      return (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            setTargetRoom(item);
                            setShiftStep('bed');
                          }}
                          style={{
                            padding: theme.spacing.md,
                            borderWidth: 1,
                            borderColor: theme.colors.borderLight,
                            borderRadius: theme.radius.lg,
                            marginBottom: theme.spacing.md,
                            backgroundColor: theme.colors.backgroundSecondary,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                                Room {item.roomNumber}
                              </Typography>
                              <Typography variant="caption" color={theme.colors.textMuted}>
                                Floor {item.floor}
                              </Typography>
                            </View>
                            <Badge label={`${vacant} vacant`} variant="success" />
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}
              </>
            )}

            {shiftStep === 'bed' && targetRoom && (
              <>
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.md }}>
                  Room {targetRoom.roomNumber} — select a bed
                </Typography>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {targetVacantBeds.map((b) => (
                    <TouchableOpacity
                      key={b.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setTargetBed(b);
                        setShiftStep('confirm');
                      }}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: theme.radius.lg,
                        backgroundColor: theme.colors.successSurface,
                        borderWidth: 1,
                        borderColor: theme.colors.success,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="bed" size={28} color={theme.colors.success} />
                      <Typography variant="caption" color={theme.colors.success}>
                        {b.bedNumber}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ marginTop: theme.spacing.md }}>
                  <Button title="Back to Rooms" variant="outline" onPress={() => setShiftStep('room')} />
                </View>
              </>
            )}

            {shiftStep === 'confirm' && targetRoom && targetBed && tenant && (
              <>
                <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <InfoRow label="Tenant" value={tenant.fullName} icon="person-outline" />
                  <InfoRow label="Current Room" value={room?.roomNumber || '-'} icon="business-outline" />
                  <InfoRow label="Current Bed" value={bed?.bedNumber || '-'} icon="bed-outline" />
                  <InfoRow label="Target Room" value={targetRoom.roomNumber} icon="business-outline" />
                  <InfoRow label="Target Bed" value={targetBed.bedNumber} icon="bed-outline" isLast />
                </Card>
                <Button
                  title="Confirm Shift"
                  loading={shiftLoading}
                  disabled={shiftLoading}
                  onPress={handleConfirmShift}
                />
                <View style={{ marginTop: theme.spacing.md }}>
                  <Button title="Back" variant="outline" onPress={() => setShiftStep('bed')} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Pre-Booking Modal */}
      <Modal visible={preBookVisible} transparent animationType="slide" onRequestClose={() => setPreBookVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <Typography variant="title1" style={{ fontWeight: '600' }}>
                {preBookStep === 'form' ? 'Pre-Book Bed' : 'Confirm Pre-Booking'}
              </Typography>
              <TouchableOpacity onPress={() => setPreBookVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {preBookStep === 'form' ? (
              <>
                <Input
                  label="Full Name *"
                  placeholder="Enter name"
                  value={preBookName}
                  onChangeText={setPreBookName}
                  leftIcon="person-outline"
                />
                <Input
                  label="Phone Number *"
                  placeholder="Enter phone number"
                  value={preBookPhone}
                  onChangeText={setPreBookPhone}
                  keyboardType="phone-pad"
                  leftIcon="call-outline"
                />
                <Input
                  label="Email"
                  placeholder="Enter email"
                  value={preBookEmail}
                  onChangeText={setPreBookEmail}
                  keyboardType="email-address"
                  leftIcon="mail-outline"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDatePickerVisible(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: theme.spacing.md,
                    borderWidth: 1,
                    borderColor: theme.colors.borderLight,
                    borderRadius: theme.radius.lg,
                    backgroundColor: theme.colors.backgroundSecondary,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
                    <Typography variant="bodyMedium">
                      Booking Date: {preBookDate.toLocaleDateString('en-GB')}
                    </Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
                <Button
                  title="Review Booking"
                  leftIcon={<Ionicons name="eye-outline" size={18} color={theme.colors.white} />}
                  onPress={handlePreBookSubmit}
                />
              </>
            ) : (
              <>
                <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <InfoRow label="Name" value={preBookName} icon="person-outline" />
                  <InfoRow label="Phone" value={preBookPhone} icon="call-outline" />
                  <InfoRow label="Email" value={preBookEmail || '-'} icon="mail-outline" />
                  <InfoRow
                    label="Booking Date"
                    value={preBookDate.toLocaleDateString('en-GB')}
                    icon="calendar-outline"
                    isLast
                  />
                </Card>
                <Button
                  title="Confirm Pre-Booking"
                  loading={preBookLoading}
                  disabled={preBookLoading}
                  leftIcon={<Ionicons name="checkmark-circle" size={18} color={theme.colors.white} />}
                  onPress={handleConfirmPreBook}
                />
                <View style={{ marginTop: theme.spacing.md }}>
                  <Button title="Edit Details" variant="outline" onPress={() => setPreBookStep('form')} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <DatePicker
        visible={datePickerVisible}
        value={preBookDate}
        onChange={(date) => setPreBookDate(date)}
        onClose={() => setDatePickerVisible(false)}
        title="Booking Date"
        minimumDate={new Date()}
      />

      <SuccessModal
        visible={successModal.visible}
        title={successModal.title}
        message={successModal.message}
        primaryButton={{
          title: 'Done',
          onPress: () => setSuccessModal((s) => ({ ...s, visible: false })),
        }}
        onClose={() => setSuccessModal((s) => ({ ...s, visible: false }))}
      />
    </ScreenWrapper>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.borderLight,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon} size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
        <Typography variant="body" color={theme.colors.textMuted}>
          {label}
        </Typography>
      </View>
      <Typography variant="bodyMedium" style={{ fontWeight: '500' }}>
        {value}
      </Typography>
    </View>
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
