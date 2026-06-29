import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper, Header, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useCreateRoom, useCreateBed } from '../../src/hooks/queries';

const schema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  floor: z.string().min(1, 'Floor is required'),
  capacity: z.string().min(1, 'Capacity is required'),
});

type FormData = z.infer<typeof schema>;

const bedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AddRoomScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPgId } = useSelectedPg();
  const createRoom = useCreateRoom();
  const createBed = useCreateBed();
  const qc = useQueryClient();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedPgId) return;
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

    // Refresh the room list so the newly added room appears immediately
    await qc.invalidateQueries({ queryKey: ['rooms'] });
    if (selectedPgId) {
      await qc.refetchQueries({ queryKey: ['rooms', 'pg', selectedPgId, 'with-beds'] });
    }

    router.back();
  };

  return (
    <ScreenWrapper>
      <Header title="Add Room" onBack={() => router.back()} backgroundColor={theme.colors.primary} textColor={theme.colors.white} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          <Card shadow="lg" padding={theme.spacing.lg}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="bed" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
              <Typography variant="title1">Room Details</Typography>
            </View>

            <Controller control={control} name="roomNumber" render={({ field }) => (
              <Input placeholder="Room Number" value={field.value} onChangeText={field.onChange} error={errors.roomNumber?.message} />
            )} />
            <Controller control={control} name="floor" render={({ field }) => (
              <Input placeholder="Floor" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} error={errors.floor?.message} />
            )} />
            <Controller control={control} name="capacity" render={({ field }) => (
              <Input placeholder="Total Beds / Capacity" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} error={errors.capacity?.message} />
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
