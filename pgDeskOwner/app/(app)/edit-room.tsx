import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useRoom, useUpdateRoom, useBedsByRoom, useCreateBed, useDeleteBed } from '../../src/hooks/queries';
import { messages, getApiErrorMessage } from '../../src/utils/validation';

const MAX_CAPACITY = 10;
const BED_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const schema = z.object({
  roomNumber: z.string().min(1, messages.required('Room Number')).max(20, 'Room number is too long'),
  floor: z
    .string()
    .min(1, messages.required('Floor'))
    .regex(/^[0-9]+$/, 'Floor must be a valid number')
    .refine((v) => Number(v) >= 0, 'Floor must be 0 or higher'),
  capacity: z
    .string()
    .min(1, messages.required('Capacity'))
    .regex(/^[1-9][0-9]?$/, 'Capacity must be a valid number')
    .refine((v) => Number(v) > 0 && Number(v) <= MAX_CAPACITY, `Capacity must be between 1 and ${MAX_CAPACITY}`),
});

type FormData = z.infer<typeof schema>;

export default function EditRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: room, isLoading } = useRoom(id);
  const { data: beds } = useBedsByRoom(id);
  const updateRoom = useUpdateRoom();
  const createBed = useCreateBed();
  const deleteBed = useDeleteBed();
  const [saving, setSaving] = useState(false);

  const occupiedBeds = beds?.filter((b) => b.status === 'OCCUPIED').length ?? 0;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (room) {
      reset({
        roomNumber: room.roomNumber,
        floor: String(room.floor ?? 0),
        capacity: String(room.capacity),
      });
    }
  }, [room, reset]);

  const syncBeds = async (roomId: string, newCapacity: number) => {
    if (!beds) return;
    const currentCount = beds.length;

    if (newCapacity > currentCount) {
      const toCreate = newCapacity - currentCount;
      await Promise.all(
        Array.from({ length: toCreate }).map((_, i) =>
          createBed.mutateAsync({
            roomId,
            bedNumber: BED_LETTERS[currentCount + i] || String(currentCount + i + 1),
            status: 'VACANT',
          })
        )
      );
    } else if (newCapacity < currentCount) {
      const excess = beds.slice(newCapacity).filter((b) => b.status === 'VACANT');
      await Promise.all(excess.map((b) => deleteBed.mutateAsync(b.id)));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!id || !room) return;
    const newCapacity = Number(data.capacity);
    if (newCapacity < occupiedBeds) {
      Alert.alert(
        'Cannot update capacity',
        `There ${occupiedBeds === 1 ? 'is' : 'are'} ${occupiedBeds} occupied bed${occupiedBeds === 1 ? '' : 's'} in this room. Capacity cannot be less than ${occupiedBeds}.`
      );
      return;
    }
    setSaving(true);
    try {
      await updateRoom.mutateAsync({
        id,
        payload: {
          pgId: room.pgId,
          roomNumber: data.roomNumber,
          floor: Number(data.floor),
          capacity: newCapacity,
        },
      });
      await syncBeds(id, newCapacity);
      Alert.alert('Success', 'Room updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Failed to update room'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.primary,
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
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>Edit Room</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg}>
            {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

            <Controller control={control} name="roomNumber" render={({ field }) => (
              <Input label="Room Number *" placeholder="Enter room number" value={field.value} onChangeText={field.onChange} error={errors.roomNumber?.message} leftIcon="bed-outline" />
            )} />
            <Controller control={control} name="floor" render={({ field }) => (
              <Input label="Floor *" placeholder="Enter floor" keyboardType="number-pad" maxLength={2} value={field.value} onChangeText={field.onChange} error={errors.floor?.message} leftIcon="layers-outline" />
            )} />
            <Controller control={control} name="capacity" render={({ field }) => (
              <Input label="Capacity *" placeholder="Enter total beds" keyboardType="number-pad" maxLength={2} value={field.value} onChangeText={field.onChange} error={errors.capacity?.message} leftIcon="people-outline" />
            )} />
          </Card>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Save Changes"
          loading={saving || updateRoom.isPending || createBed.isPending || deleteBed.isPending}
          leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
