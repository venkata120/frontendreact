import { useRouter } from 'expo-router';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper, Header, Typography, Card, Button, Input } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useCreateRoom, useCreateBed, useProperty } from '../../src/hooks/queries';
import { getApiErrorMessage } from '../../src/utils/validation';

const SHARING_OPTIONS = [
  { key: 'single', label: 'Single', beds: 1 },
  { key: 'double', label: 'Double', beds: 2 },
  { key: 'triple', label: 'Triple', beds: 3 },
  { key: 'four', label: 'Four', beds: 4 },
  { key: 'five', label: 'Five', beds: 5 },
  { key: 'other', label: 'Other', beds: 0 },
];

const MAX_CAPACITY = 10;
const ROOM_NUMBER_MAX_LENGTH = 10;

const bedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AddRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const { selectedPgId, selectedPg } = useSelectedPg();
  const { data: property } = useProperty(selectedPgId || undefined);

  const createRoom = useCreateRoom();
  const createBed = useCreateBed();

  const maxFloors = property?.numberOfFloors ?? selectedPg?.numberOfFloors;

  const [floor, setFloor] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedSharing, setSelectedSharing] = useState<string | null>(null);
  const [customCapacity, setCustomCapacity] = useState('');
  const [baseRent, setBaseRent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const capacity = selectedSharing
    ? selectedSharing === 'other'
      ? Number(customCapacity) || 0
      : SHARING_OPTIONS.find((s) => s.key === selectedSharing)?.beds ?? 0
    : 0;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!roomNumber.trim()) {
      next.roomNumber = 'Room number is required';
    } else if (!/^[A-Za-z0-9\-/]+$/.test(roomNumber.trim())) {
      next.roomNumber = 'Room number can only contain letters, numbers, hyphen or slash';
    } else if (roomNumber.trim().length > ROOM_NUMBER_MAX_LENGTH) {
      next.roomNumber = `Room number must be ${ROOM_NUMBER_MAX_LENGTH} characters or less`;
    }
    if (!floor.trim()) {
      next.floor = 'Floor number is required';
    } else {
      const f = Number(floor);
      if (Number.isNaN(f) || f < 0) next.floor = 'Enter a valid floor number';
      if (maxFloors !== undefined && maxFloors > 0 && f > maxFloors) {
        next.floor = `Floor must be between 0 and ${maxFloors}`;
      }
    }
    if (!selectedSharing) next.sharing = 'Select room sharing';
    if (selectedSharing === 'other' && (capacity <= 0 || capacity > MAX_CAPACITY)) {
      next.customCapacity = `Enter beds between 1 and ${MAX_CAPACITY}`;
    }
    if (baseRent.trim() && !/^\d+$/.test(baseRent.trim())) {
      next.baseRent = 'Base rent must be a valid number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => {
    setFloor('');
    setRoomNumber('');
    setSelectedSharing(null);
    setCustomCapacity('');
    setBaseRent('');
    setErrors({});
  };

  const onSubmit = async () => {
    if (!validate() || !selectedPgId) return;

    try {
      const room = await createRoom.mutateAsync({
        pgId: selectedPgId,
        roomNumber: roomNumber.trim(),
        floor: Number(floor),
        capacity,
      });

      await Promise.all(
        Array.from({ length: capacity }).map((_, i) =>
          createBed.mutateAsync({
            roomId: room.id,
            bedNumber: bedLetters[i] || String(i + 1),
            status: 'VACANT',
          })
        )
      );

      await qc.invalidateQueries({ queryKey: ['rooms'] });
      if (selectedPgId) {
        await qc.refetchQueries({ queryKey: ['rooms', 'pg', selectedPgId, 'with-beds'] });
      }

      setShowSuccess(true);
    } catch (err: any) {
      const message = getApiErrorMessage(err, 'Failed to add room');
      setErrors({ submit: message });
      Alert.alert('Unable to add room', message);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Add Room" onBack={() => router.back()} backgroundColor={theme.colors.primary} textColor={theme.colors.white} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
            {!selectedPgId && (
              <Card shadow="lg" padding={theme.spacing.xl} style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: theme.colors.primarySurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <Ionicons name="business-outline" size={40} color={theme.colors.primary} />
                </View>
                <Typography variant="title1" style={{ marginBottom: theme.spacing.sm }}>
                  Please create a property first
                </Typography>
                <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginBottom: theme.spacing.lg }}>
                  You need a PG property before you can add rooms.
                </Typography>
                <Button
                  title="Create Property"
                  onPress={() => router.push('/screens/add-property' as any)}
                  leftIcon={<Ionicons name="add-circle" size={20} color={theme.colors.white} />}
                />
              </Card>
            )}

            {selectedPgId && (
            <Card shadow="lg" padding={theme.spacing.lg}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Ionicons name="bed" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
                <Typography variant="title1">Room Details</Typography>
              </View>

              {/* Floor number */}
              <Input
                label="Floor number"
                placeholder={`Enter floor number${maxFloors ? ` (0-${maxFloors})` : ''}`}
                keyboardType="number-pad"
                maxLength={2}
                value={floor}
                onChangeText={(v) => setFloor(v.replace(/[^0-9]/g, ''))}
                error={errors.floor}
                leftIcon={<Ionicons name="layers-outline" size={18} color={theme.colors.textMuted} />}
              />

              {/* Room number */}
              <Input
                label="Room Number"
                placeholder="Enter room number"
                maxLength={ROOM_NUMBER_MAX_LENGTH}
                value={roomNumber}
                onChangeText={setRoomNumber}
                error={errors.roomNumber}
                leftIcon={<Ionicons name="create-outline" size={18} color={theme.colors.textMuted} />}
              />

              {/* Room Sharing */}
              <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                Room Sharing <Typography color={theme.colors.danger}>*</Typography>
              </Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: theme.spacing.md }}>
                {SHARING_OPTIONS.map((option) => {
                  const isSelected = selectedSharing === option.key;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      activeOpacity={0.8}
                      onPress={() => setSelectedSharing(option.key)}
                      style={{
                        width: '30%',
                        alignItems: 'center',
                        paddingVertical: theme.spacing.md,
                        borderRadius: theme.radius.lg,
                        backgroundColor: isSelected ? theme.colors.primarySurface : theme.colors.backgroundSecondary,
                        borderWidth: 1.5,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                      }}
                    >
                      <Ionicons
                        name="bed"
                        size={22}
                        color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                      />
                      <Typography variant="bodyMedium" color={isSelected ? theme.colors.primary : theme.colors.text}>
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textMuted}>
                        {option.beds || 'Custom'} Beds
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.sharing && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  {errors.sharing}
                </Typography>
              )}

              {/* Custom capacity */}
              {selectedSharing === 'other' && (
                <Input
                  label="Number of Beds"
                  placeholder={`Enter beds (1-${MAX_CAPACITY})`}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={customCapacity}
                  onChangeText={(v) => setCustomCapacity(v.replace(/[^0-9]/g, ''))}
                  error={errors.customCapacity}
                />
              )}

              {/* Base rent per bed */}
              <Input
                label="Base Rent per Bed"
                placeholder="Enter base rent per bed"
                keyboardType="number-pad"
                maxLength={8}
                value={baseRent}
                onChangeText={(v) => {
                  setBaseRent(v.replace(/[^0-9]/g, ''));
                  if (errors.baseRent) setErrors((prev) => ({ ...prev, baseRent: '' }));
                }}
                error={errors.baseRent}
                leftIcon={
                  <Typography variant="bodyMedium" color={theme.colors.textMuted}>
                    ₹
                  </Typography>
                }
              />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.secondary} />
                <Typography variant="caption" color={theme.colors.secondary} style={{ marginLeft: theme.spacing.xs }}>
                  You can edit or update room details later.
                </Typography>
              </View>

              {errors.submit && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                  {errors.submit}
                </Typography>
              )}
            </Card>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {selectedPgId && (
        <View style={{ padding: theme.spacing.base }}>
          <Button
            title="Add Room"
            loading={createRoom.isPending || createBed.isPending}
            leftIcon={<Ionicons name="add-circle" size={20} color={theme.colors.white} />}
            onPress={onSubmit}
          />
        </View>
      )}

      {/* Success modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.xl} style={{ width: '100%', maxWidth: 340, alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.successSurface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              <Ionicons name="checkmark" size={40} color={theme.colors.success} />
            </View>
            <Typography variant="title1" style={{ marginBottom: theme.spacing.sm }}>
              Added
            </Typography>
            <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginBottom: theme.spacing.lg }}>
              Room added Successfully..!
            </Typography>
            <View style={{ flexDirection: 'row', width: '100%', gap: theme.spacing.md }}>
              <Button
                title="Go to Home"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => {
                  setShowSuccess(false);
                  resetForm();
                  router.replace('/(app)/(tabs)');
                }}
              />
              <Button
                title="Add one more"
                style={{ flex: 1 }}
                onPress={() => {
                  setShowSuccess(false);
                  resetForm();
                }}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
