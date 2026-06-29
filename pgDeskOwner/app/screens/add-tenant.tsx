import { useEffect, useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Input, Button, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useCreateTenant } from '../../src/hooks/queries';
import { useRoomsWithBeds } from '../../src/hooks/queries/useRoomsWithBeds';
import { bedsService } from '../../src/api/services';


const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  emergencyContact: z.string().optional().or(z.literal('')),
  rentPerMonth: z.string().min(1, 'Rent is required'),
  advanceAmount: z.string().optional(),
  joinDate: z.string().min(1, 'Join date is required'),
});

type FormData = z.infer<typeof schema>;

interface PickerProps {
  label: string;
  value?: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

const Picker: React.FC<PickerProps> = ({ label, value, placeholder, options, onSelect, disabled }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>{label}</Typography>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          backgroundColor: disabled ? theme.colors.backgroundSecondary : theme.colors.white,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        }}
      >
        <Typography variant="bodyMedium" color={selected ? theme.colors.text : theme.colors.textMuted}>
          {selected ? selected.label : placeholder}
        </Typography>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, paddingBottom: 24, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.base, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
              <Typography variant="title1">{label}</Typography>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                  style={{
                    padding: theme.spacing.base,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.borderLight,
                    backgroundColor: item.value === value ? theme.colors.primarySurface : theme.colors.white,
                  }}
                >
                  <Typography variant="bodyMedium" color={item.value === value ? theme.colors.primary : theme.colors.text}>{item.label}</Typography>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default function AddTenantScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { pgId } = useLocalSearchParams<{ pgId: string }>();
  const createTenant = useCreateTenant();
  const { data: rooms, isLoading: roomsLoading } = useRoomsWithBeds(pgId);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { joinDate: new Date().toISOString().slice(0, 10) },
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const roomsList = useMemo(() => rooms || [], [rooms]);
  const selectedRoom = useMemo(() => roomsList.find((r) => r.id === selectedRoomId), [roomsList, selectedRoomId]);
  const vacantBeds = useMemo(() => selectedRoom?.beds?.filter((b) => b.status === 'VACANT') || [], [selectedRoom]);

  useEffect(() => {
    setSelectedBedId('');
  }, [selectedRoomId]);

  const roomOptions = useMemo(
    () => roomsList.map((r) => ({ label: `Room ${r.roomNumber} (Floor ${r.floor})`, value: r.id })),
    [roomsList]
  );
  const bedOptions = useMemo(
    () => vacantBeds.map((b) => ({ label: `Bed ${b.bedNumber}`, value: b.id })),
    [vacantBeds]
  );

  const onSubmit = async (data: FormData) => {
    if (!pgId) {
      setError('PG not selected');
      return;
    }
    if (!selectedBedId) {
      setError('Please select a vacant bed');
      return;
    }
    setError(null);
    try {
      const normalizePhone = (phone: string): string => {
        const digits = phone.replace(/\D/g, '');
        if (phone.trim().startsWith('+')) return phone.trim();
        if (digits.length === 10) return `+91${digits}`;
        return `+${digits}`;
      };
      await createTenant.mutateAsync({
        pgId,
        bedId: selectedBedId,
        fullName: data.fullName,
        phone: normalizePhone(data.phone),
        email: data.email,
        emergencyContact: data.emergencyContact ? normalizePhone(data.emergencyContact) : undefined,
        joinDate: data.joinDate,
        exitDate: undefined,
        status: 'ACTIVE',
        rentPerMonth: Number(data.rentPerMonth),
        advanceAmount: data.advanceAmount ? Number(data.advanceAmount) : 0,
      });
      await bedsService.updateStatus(selectedBedId, 'OCCUPIED');
      router.back();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to add tenant');
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
          <Typography variant="headline2" color={theme.colors.white}>Add Tenant</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="person" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title1">Personal information</Typography>
            </View>

            <Controller control={control} name="fullName" render={({ field }) => (
              <Input label="Full Name *" placeholder="Enter full name" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} leftIcon="person-outline" />
            )} />
            <Controller control={control} name="phone" render={({ field }) => (
              <Input label="Mobile number *" placeholder="Enter mobile number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} leftIcon="call-outline" />
            )} />
            <Controller control={control} name="email" render={({ field }) => (
              <Input label="Email" placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={errors.email?.message} leftIcon="mail-outline" />
            )} />
            <Controller control={control} name="emergencyContact" render={({ field }) => (
              <Input label="Emergency Contact" placeholder="Enter emergency contact" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.emergencyContact?.message} leftIcon="people-outline" />
            )} />
            <Controller control={control} name="rentPerMonth" render={({ field }) => (
              <Input label="Rent Per Month *" placeholder="Enter rent" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.rentPerMonth?.message} leftIcon="cash-outline" />
            )} />
            <Controller control={control} name="advanceAmount" render={({ field }) => (
              <Input label="Advance Amount" placeholder="Enter advance amount" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.advanceAmount?.message} leftIcon="wallet-outline" />
            )} />
            <Controller control={control} name="joinDate" render={({ field }) => (
              <Input label="Join Date *" placeholder="YYYY-MM-DD" value={field.value} onChangeText={field.onChange} error={errors.joinDate?.message} leftIcon="calendar-outline" />
            )} />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
              <Ionicons name="bed" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title1">Room Allocation</Typography>
            </View>

            {roomsLoading ? (
              <Typography variant="body" color={theme.colors.textMuted}>Loading rooms...</Typography>
            ) : roomsList.length === 0 ? (
              <Typography variant="body" color={theme.colors.textMuted}>No rooms found. Please add rooms first.</Typography>
            ) : (
              <>
                <Picker
                  label="Select Room"
                  value={selectedRoomId}
                  placeholder="Choose a room"
                  options={roomOptions}
                  onSelect={setSelectedRoomId}
                />
                {selectedRoomId && (
                  <>
                    {vacantBeds.length === 0 ? (
                      <Typography variant="body" color={theme.colors.danger}>No vacant beds in this room.</Typography>
                    ) : (
                      <Picker
                        label="Select Bed"
                        value={selectedBedId}
                        placeholder="Choose a vacant bed"
                        options={bedOptions}
                        onSelect={setSelectedBedId}
                      />
                    )}
                  </>
                )}
              </>
            )}

            {error && (
              <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                {error}
              </Typography>
            )}
          </Card>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Add Tenant"
          loading={createTenant.isPending}
          leftIcon={<Ionicons name="person-add" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
