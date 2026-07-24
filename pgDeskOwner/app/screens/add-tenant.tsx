import { useEffect, useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Typography,
  Input,
  Button,
  Card,
  ScreenHeader,
  SuccessModal,
} from '../../src/components';
import { DatePicker } from '../../src/components/DatePicker/DatePicker';
import { useTheme } from '../../src/hooks/useTheme';
import { useCreateTenant, useUpdateBedStatus } from '../../src/hooks/queries';
import { useRoomsWithBeds } from '../../src/hooks/queries/useRoomsWithBeds';
import { regex, messages, normalizeMobile, sanitizeMobile, getApiErrorMessage } from '../../src/utils/validation';

const schema = z.object({
  fullName: z.string().min(1, messages.required('Full Name')).regex(regex.alphabetsOnly, messages.alphabetsOnly('Full Name')),
  phone: z.string().min(1, messages.required('Mobile Number')).regex(regex.mobile, messages.validMobile('Mobile Number')),
  email: z.union([z.literal(''), z.string().regex(regex.email, messages.validEmail('Email'))]).optional(),
  emergencyContact: z.union([z.literal(''), z.string().regex(regex.mobile, messages.validMobile('Emergency Contact'))]).optional(),
  rentPerMonth: z.string().min(1, messages.required('Rent Per Month')).regex(regex.digitsOnly, 'Rent must be a valid number'),
  advanceAmount: z.union([z.literal(''), z.string().regex(regex.digitsOnly, 'Advance Amount must be a valid number')]).optional(),
  joinDate: z.string().min(1, messages.required('Join Date')),
  gender: z.enum(['M', 'F', 'O'], { message: 'Gender is required' }),
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
      <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
        {label}
      </Typography>
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

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              paddingBottom: 24,
              maxHeight: '80%',
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.colors.border,
                marginTop: theme.spacing.md,
                marginBottom: theme.spacing.sm,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: theme.spacing.base,
                paddingBottom: theme.spacing.base,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.borderLight,
              }}
            >
              <Typography variant="title1">{label}</Typography>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {options.length === 0 ? (
              <View style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
                <Typography variant="body" color={theme.colors.textMuted}>
                  No options available
                </Typography>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onSelect(item.value);
                        setOpen(false);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: theme.spacing.base,
                        paddingVertical: theme.spacing.md,
                        minHeight: 52,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.borderLight,
                        backgroundColor: isSelected ? theme.colors.primarySurface : theme.colors.white,
                        borderRadius: theme.radius.md,
                        marginHorizontal: theme.spacing.sm,
                        marginVertical: theme.spacing.xs,
                      }}
                    >
                      <Typography variant="bodyMedium" color={isSelected ? theme.colors.primary : theme.colors.text}>
                        {item.label}
                      </Typography>
                      {isSelected && <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
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
  const updateBedStatus = useUpdateBedStatus();
  const { data: rooms, isLoading: roomsLoading } = useRoomsWithBeds(pgId);

  const { control, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { joinDate: new Date().toISOString().slice(0, 10), gender: undefined },
  });

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [successOpen, setSuccessOpen] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const roomsList = useMemo(() => rooms || [], [rooms]);
  const selectedRoom = useMemo(() => roomsList.find((r) => r.id === selectedRoomId), [roomsList, selectedRoomId]);
  const vacantBeds = useMemo(() => selectedRoom?.beds?.filter((b) => b.status === 'VACANT') || [], [selectedRoom]);

  useEffect(() => {
    setSelectedBedId('');
  }, [selectedRoomId]);

  const capturePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to photos to upload a profile image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

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
      await createTenant.mutateAsync({
        pgId,
        bedId: selectedBedId,
        fullName: data.fullName,
        phone: normalizeMobile(data.phone),
        email: data.email || undefined,
        emergencyContact: data.emergencyContact ? normalizeMobile(data.emergencyContact) : undefined,
        joinDate: data.joinDate,
        exitDate: undefined,
        status: 'ACTIVE',
        rentPerMonth: Number(data.rentPerMonth),
        advanceAmount: data.advanceAmount ? Number(data.advanceAmount) : 0,
        gender: data.gender,
      });
      await updateBedStatus.mutateAsync({ id: selectedBedId, status: 'OCCUPIED' });
      setSuccessOpen(true);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to add tenant'));
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Add Tenant"
        backgroundColor={theme.colors.primary}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: theme.spacing.xl }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: theme.spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing['2xl'] }}>
            <Card shadow="lg" padding={theme.spacing.lg}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Ionicons name="camera" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Typography variant="title1">Tenant Photo</Typography>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={capturePhoto}
                style={{
                  alignSelf: 'center',
                  width: '100%',
                  height: 160,
                  borderRadius: theme.radius.lg,
                  borderWidth: 2,
                  borderColor: theme.colors.accentPurple,
                  borderStyle: 'dashed',
                  backgroundColor: '#FAF5FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.lg,
                  overflow: 'hidden',
                }}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <>
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#F3E8FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      <Ionicons name="camera" size={28} color={theme.colors.accentPurple} />
                    </View>
                    <Typography variant="bodyMedium" color={theme.colors.accentPurple} style={{ fontWeight: '600' }}>
                      Capture Selfie
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      Take a clear photo for verification
                    </Typography>
                  </>
                )}
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Ionicons name="person" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Typography variant="title1">Personal information</Typography>
              </View>

              <Controller
                control={control}
                name="fullName"
                render={({ field }) => (
                  <Input label="Full Name *" placeholder="Enter full name" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} leftIcon="person-outline" />
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <View style={{ position: 'relative' }}>
                    <Input
                      label="Mobile number *"
                      placeholder="Enter mobile number"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={field.value}
                      onChangeText={(v) => field.onChange(sanitizeMobile(v))}
                      error={errors.phone?.message}
                      leftIcon="call-outline"

                    />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input
                    label="Email"
                    placeholder="Enter email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={field.value}
                    onChangeText={(v) => field.onChange(v.trim())}
                    onBlur={() => {
                      field.onBlur();
                      trigger('email');
                    }}
                    error={errors.email?.message}
                    leftIcon="mail-outline"
                  />
                )}
              />
              <Controller
                control={control}
                name="emergencyContact"
                render={({ field }) => (
                  <Input label="Emergency Contact" placeholder="Enter emergency contact" keyboardType="phone-pad" maxLength={10} value={field.value} onChangeText={(v) => field.onChange(sanitizeMobile(v))} error={errors.emergencyContact?.message} leftIcon="people-outline" />
                )}
              />
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Picker
                    label="Gender *"
                    value={field.value}
                    placeholder="Select gender"
                    options={[
                      { label: 'Male', value: 'M' },
                      { label: 'Female', value: 'F' },
                      { label: 'Other', value: 'O' },
                    ]}
                    onSelect={field.onChange}
                  />
                )}
              />
              {errors.gender && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  {errors.gender.message}
                </Typography>
              )}
              <Controller
                control={control}
                name="rentPerMonth"
                render={({ field }) => (
                  <Input label="Rent Per Month *" placeholder="Enter rent" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.rentPerMonth?.message} leftIcon="cash-outline" />
                )}
              />
              <Controller
                control={control}
                name="advanceAmount"
                render={({ field }) => (
                  <Input label="Advance Amount" placeholder="Enter advance amount" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.advanceAmount?.message} leftIcon="wallet-outline" />
                )}
              />
              <Controller
                control={control}
                name="joinDate"
                render={({ field }) => (
                  <>
                    <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                      Join Date *
                    </Typography>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setDatePickerVisible(true)}
                      style={{
                        borderWidth: 1,
                        borderColor: errors.joinDate ? theme.colors.danger : theme.colors.border,
                        borderRadius: theme.radius.md,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.md,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: theme.spacing.md,
                        backgroundColor: theme.colors.white,
                      }}
                    >
                      <Typography variant="bodyMedium" color={field.value ? theme.colors.text : theme.colors.textMuted}>
                        {field.value || 'Select join date'}
                      </Typography>
                      <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
                    </TouchableOpacity>
                    {errors.joinDate && (
                      <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                        {errors.joinDate.message}
                      </Typography>
                    )}
                  </>
                )}
              />

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
                  <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                    Select Room
                  </Typography>
                  <View style={{ marginBottom: theme.spacing.md }}>
                    {roomsList.map((room) => {
                      const vacantCount = room.beds?.filter((b) => b.status === 'VACANT').length ?? 0;
                      const totalBeds = room.beds?.length ?? room.capacity;
                      const isSelected = selectedRoomId === room.id;
                      return (
                        <TouchableOpacity
                          key={room.id}
                          activeOpacity={0.8}
                          onPress={() => setSelectedRoomId(room.id)}
                          style={{
                            borderWidth: 2,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                            borderRadius: theme.radius.lg,
                            backgroundColor: isSelected ? theme.colors.primarySurface : theme.colors.backgroundSecondary,
                            padding: theme.spacing.md,
                            marginBottom: theme.spacing.sm,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ionicons name="business-outline" size={20} color={isSelected ? theme.colors.primary : theme.colors.textMuted} style={{ marginRight: 8 }} />
                              <View>
                                <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                                  Room {room.roomNumber}
                                </Typography>
                                <Typography variant="caption" color={theme.colors.textMuted}>
                                  Floor {room.floor}
                                </Typography>
                              </View>
                            </View>
                            <Typography variant="caption" color={vacantCount > 0 ? theme.colors.success : theme.colors.danger}>
                              {vacantCount}/{totalBeds} vacant
                            </Typography>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {selectedRoomId && (
                    <>
                      <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                        Select Bed
                      </Typography>
                      {vacantBeds.length === 0 ? (
                        <Typography variant="body" color={theme.colors.danger} style={{ marginBottom: theme.spacing.md }}>
                          No vacant beds in this room.
                        </Typography>
                      ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: theme.spacing.md }}>
                          {vacantBeds.map((bed) => {
                            const isSelected = selectedBedId === bed.id;
                            return (
                              <TouchableOpacity
                                key={bed.id}
                                activeOpacity={0.8}
                                onPress={() => setSelectedBedId(bed.id)}
                                style={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: theme.radius.lg,
                                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.backgroundSecondary,
                                  borderWidth: 1.5,
                                  borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Ionicons name="bed" size={18} color={isSelected ? theme.colors.white : theme.colors.textMuted} />
                                <Typography variant="caption" color={isSelected ? theme.colors.white : theme.colors.text}>
                                  {bed.bedNumber}
                                </Typography>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
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

              <View style={{ flexDirection: 'row', marginTop: theme.spacing.lg, gap: theme.spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Button title="Cancel" variant="outline" onPress={() => router.back()} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title="Add Tenant"
                    loading={createTenant.isPending}
                    disabled={createTenant.isPending}
                    onPress={handleSubmit(onSubmit)}
                    leftIcon={<Ionicons name="person-add" size={20} color={theme.colors.white} />}
                  />
                </View>
              </View>
            </Card>
          </View>
          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={successOpen}
        icon="checkmark-circle"
        title="Tenant Added Successfully"
        message="The tenant has been allocated to the selected bed."
        primaryButton={{
          title: 'Done',
          onPress: () => {
            setSuccessOpen(false);
            router.back();
          },
        }}
        secondaryButton={{
          title: 'Go to Home',
          onPress: () => {
            setSuccessOpen(false);
            router.replace('/(app)/(tabs)');
          },
        }}
      />

      <DatePicker
        visible={datePickerVisible}
        value={watch('joinDate')}
        onChange={(date) => setValue('joinDate', date.toISOString().slice(0, 10))}
        onClose={() => setDatePickerVisible(false)}
        title="Select Join Date"
        minimumDate={new Date()}
      />
    </ScreenWrapper>
  );
}
