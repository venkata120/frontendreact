import { useRouter } from 'expo-router';
import { View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper, Header, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useCreateRoom, useCreateBed, useProperty } from '../../src/hooks/queries';
import { regex, messages, getApiErrorMessage } from '../../src/utils/validation';

const MAX_CAPACITY = 10;

function buildSchema(maxFloors?: number) {
  return z.object({
    roomNumber: z
      .string()
      .min(1, messages.required('Room Number'))
      .max(20, 'Room number is too long'),
    floor: z
      .string()
      .min(1, messages.required('Floor'))
      .regex(regex.positiveInteger, 'Floor must be a valid number')
      .refine((v) => {
        const n = Number(v);
        return n > 0 && (maxFloors === undefined || n <= maxFloors);
      }, maxFloors !== undefined && maxFloors > 0
        ? `Floor must be between 1 and ${maxFloors}`
        : 'Floor must be a positive number'),
    capacity: z
      .string()
      .min(1, messages.required('Total Beds / Capacity'))
      .regex(regex.positiveInteger, 'Capacity must be a valid number')
      .refine((v) => Number(v) > 0 && Number(v) <= MAX_CAPACITY, `Capacity must be between 1 and ${MAX_CAPACITY}`),
  });
}

type FormData = {
  roomNumber: string;
  floor: string;
  capacity: string;
};

const bedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AddRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPgId, selectedPg } = useSelectedPg();
  const { data: property } = useProperty(selectedPgId || undefined);
  const createRoom = useCreateRoom();
  const createBed = useCreateBed();
  const qc = useQueryClient();

  const maxFloors = property?.numberOfFloors ?? selectedPg?.numberOfFloors;

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(buildSchema(maxFloors)),
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedPgId) return;
    try {
      const room = await createRoom.mutateAsync({
        pgId: selectedPgId,
        roomNumber: data.roomNumber,
        floor: Number(data.floor),
        capacity: Number(data.capacity),
      });

      const capacity = Number(data.capacity);
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

      Alert.alert('Success', 'Room added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Failed to add room'));
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Add Room" onBack={() => router.back()} backgroundColor={theme.colors.primary} textColor={theme.colors.white} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
            <Card shadow="lg" padding={theme.spacing.lg}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Ionicons name="bed" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
                <Typography variant="title1">Room Details</Typography>
              </View>

              <Controller control={control} name="roomNumber" render={({ field }) => (
                <Input placeholder="Room Number *" value={field.value} onChangeText={field.onChange} error={errors.roomNumber?.message} />
              )} />
              <Controller control={control} name="floor" render={({ field }) => (
                <Input placeholder={`Floor *${maxFloors ? ` (1-${maxFloors})` : ''}`} keyboardType="number-pad" maxLength={2} value={field.value} onChangeText={field.onChange} error={errors.floor?.message} />
              )} />
              <Controller control={control} name="capacity" render={({ field }) => (
                <Input placeholder={`Total Beds / Capacity * (1-${MAX_CAPACITY})`} keyboardType="number-pad" maxLength={2} value={field.value} onChangeText={field.onChange} error={errors.capacity?.message} />
              )} />

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.secondary} />
                <Typography variant="caption" color={theme.colors.secondary} style={{ marginLeft: theme.spacing.xs }}>
                  Beds will be created automatically (A, B, C...).
                </Typography>
              </View>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Add Room"
          loading={createRoom.isPending || createBed.isPending}
          leftIcon={<Ionicons name="add-circle" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
