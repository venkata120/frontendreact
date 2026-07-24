import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useCreateStaff, useUpdateStaff, useStaffByProperty } from '../../src/hooks/queries';
import { getApiErrorMessage, regex, messages, normalizeMobile } from '../../src/utils/validation';
import type { StaffPaymentType, StaffRole, StaffShift } from '../../src/types';

const ROLE_OPTIONS: { label: string; value: StaffRole }[] = [
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Security', value: 'SECURITY' },
  { label: 'Housekeeping', value: 'HOUSE_KEEPER' },
  { label: 'Cook', value: 'COOK' },
  { label: 'Cleaner', value: 'CLEANER' },
  { label: 'Maid', value: 'MAID' },
  { label: 'Others', value: 'OTHERS' },
];

const SHIFT_OPTIONS: { label: string; value: StaffShift }[] = [
  { label: 'Morning', value: 'MORNING' },
  { label: 'Afternoon', value: 'AFTER_NOON' },
  { label: 'Evening', value: 'NIGHT' },
  { label: 'Full Day', value: 'ALL_DAY' },
];

const PAYMENT_OPTIONS: { label: string; value: StaffPaymentType }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
];

const schema = z.object({
  fullName: z
    .string()
    .min(1, messages.required('Full Name'))
    .min(3, 'Full name must be at least 3 characters')
    .max(50, 'Full name must be 50 characters or less')
    .regex(regex.alphabetsOnly, messages.alphabetsOnly('Full Name')),
  mobileNumber: z
    .string()
    .min(1, messages.required('Mobile Number'))
    .regex(regex.mobile, messages.validMobile('Mobile Number')),
  role: z.enum(['MANAGER', 'COOK', 'HOUSE_KEEPER', 'SECURITY', 'MAID', 'CLEANER', 'OTHERS'], {
    message: 'Role is required',
  }),
  otherRole: z.string().max(30, 'Other role must be 30 characters or less').optional(),
  shift: z.enum(['ALL_DAY', 'MORNING', 'AFTER_NOON', 'NIGHT'], {
    message: 'Shift is required',
  }),
  salary: z
    .string()
    .min(1, messages.required('Salary'))
    .regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Salary must be a valid number'),
  paymentType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY'], { message: 'Payment type is required' }),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export default function StaffManagementScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPg } = useSelectedPg();
  const { staffId, edit } = useLocalSearchParams<{ staffId?: string; edit?: string }>();
  const isEditMode = edit === 'true' && !!staffId;

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const { data: staffList, isLoading: staffListLoading } = useStaffByProperty(selectedPg?.id);
  const existingStaff = staffList?.find((s) => s.staffId === staffId);

  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'CLEANER',
      shift: 'ALL_DAY',
      paymentType: 'MONTHLY',
      isActive: true,
    },
  });

  const selectedRole = watch('role');
  const selectedShift = watch('shift');
  const selectedPayment = watch('paymentType');
  const isActive = watch('isActive');

  useEffect(() => {
    if (!isEditMode || !existingStaff) return;
    reset({
      fullName: existingStaff.fullName,
      mobileNumber: existingStaff.mobileNumber,
      role: existingStaff.role,
      otherRole: existingStaff.otherRole || '',
      shift: existingStaff.shift,
      salary: String(existingStaff.salary),
      paymentType: existingStaff.paymentType,
      isActive: existingStaff.isActive,
    });
  }, [isEditMode, existingStaff, reset]);

  const pickImage = async () => {
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
      setPhoto(result.assets[0]);
    }
  };

  const buildPayload = (data: FormData): any => {
    const payload = {
      fullName: data.fullName.trim(),
      mobileNumber: normalizeMobile(data.mobileNumber),
      role: data.role,
      shift: data.shift,
      salary: Number(data.salary),
      paymentType: data.paymentType,
      isActive: data.isActive,
    };
    if (data.role === 'OTHERS') {
      (payload as any).otherRole = data.otherRole?.trim();
    }
    return payload;
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedPg?.id) {
      Alert.alert('Property required', 'Please select a property first.');
      return;
    }
    if (data.role === 'OTHERS' && !data.otherRole?.trim()) {
      Alert.alert('Other role required', 'Please enter the other role for this staff member.');
      return;
    }

    const imageFile = photo
      ? {
          uri: photo.uri,
          name: photo.fileName || 'staff.jpg',
          type: photo.mimeType || 'image/jpeg',
        }
      : undefined;

    try {
      if (isEditMode && staffId) {
        await updateStaff.mutateAsync({
          propertyId: selectedPg.id,
          staffId,
          staff: buildPayload(data),
          profilePhoto: imageFile,
        });
        Alert.alert('Success', 'Staff details updated successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await createStaff.mutateAsync({
          propertyId: selectedPg.id,
          staff: buildPayload(data),
          profilePhoto: imageFile,
        });
        reset();
        setPhoto(null);
        Alert.alert('Success', 'Staff member added successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err: any) {
      Alert.alert(
        isEditMode ? 'Unable to update staff' : 'Unable to add staff',
        getApiErrorMessage(err, isEditMode ? 'Failed to update staff' : 'Failed to add staff')
      );
    }
  };

  const isPending = createStaff.isPending || updateStaff.isPending || staffListLoading;

  return (
    <ScreenWrapper>
      <Header title={isEditMode ? 'Edit Staff' : 'Add Staff'} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        >
          <View style={{ padding: theme.spacing.base }}>
            <Card shadow="lg" padding={theme.spacing.lg}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickImage}
                style={{
                  alignSelf: 'center',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 2,
                  borderColor: theme.colors.border,
                  borderStyle: 'dashed',
                  backgroundColor: theme.colors.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.lg,
                  overflow: 'hidden',
                }}
              >
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : existingStaff?.profilePhotoUrl ? (
                  <Image
                    source={{ uri: existingStaff.profilePhotoUrl }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <Ionicons name="camera" size={32} color={theme.colors.primary} />
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                      Add Photo
                    </Typography>
                  </>
                )}
              </TouchableOpacity>

              <Controller
                control={control}
                name="fullName"
                render={({ field }) => (
                  <Input
                    label="Full Name *"
                    placeholder="Enter full name"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.fullName?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="mobileNumber"
                render={({ field }) => (
                  <Input
                    label="Mobile Number *"
                    placeholder="Enter mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={field.value}
                    onChangeText={(v) => field.onChange(v.replace(/[^0-9]/g, ''))}
                    error={errors.mobileNumber?.message}
                  />
                )}
              />

              <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                Role *
              </Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.base }}>
                {ROLE_OPTIONS.map((option) => {
                  const isSelected = selectedRole === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.8}
                      onPress={() => setValue('role', option.value, { shouldValidate: true })}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderRadius: theme.radius.full,
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.backgroundSecondary,
                        borderWidth: 1,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                        marginRight: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      <Typography variant="bodyMedium" color={isSelected ? theme.colors.white : theme.colors.text}>
                        {option.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.role && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  {errors.role.message}
                </Typography>
              )}

              {selectedRole === 'OTHERS' && (
                <Controller
                  control={control}
                  name="otherRole"
                  render={({ field }) => (
                    <Input
                      label="Other Role *"
                      placeholder="Specify role"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.otherRole?.message}
                    />
                  )}
                />
              )}

              <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                Shift *
              </Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.base }}>
                {SHIFT_OPTIONS.map((option) => {
                  const isSelected = selectedShift === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.8}
                      onPress={() => setValue('shift', option.value, { shouldValidate: true })}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderRadius: theme.radius.full,
                        backgroundColor: isSelected ? theme.colors.secondary : theme.colors.backgroundSecondary,
                        borderWidth: 1,
                        borderColor: isSelected ? theme.colors.secondary : theme.colors.borderLight,
                        marginRight: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      <Typography variant="bodyMedium" color={isSelected ? theme.colors.white : theme.colors.text}>
                        {option.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.shift && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  {errors.shift.message}
                </Typography>
              )}

              <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                Payment Type *
              </Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.base }}>
                {PAYMENT_OPTIONS.map((option) => {
                  const isSelected = selectedPayment === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.8}
                      onPress={() => setValue('paymentType', option.value, { shouldValidate: true })}
                      style={{
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderRadius: theme.radius.full,
                        backgroundColor: isSelected ? theme.colors.success : theme.colors.backgroundSecondary,
                        borderWidth: 1,
                        borderColor: isSelected ? theme.colors.success : theme.colors.borderLight,
                        marginRight: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      <Typography variant="bodyMedium" color={isSelected ? theme.colors.white : theme.colors.text}>
                        {option.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.paymentType && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  {errors.paymentType.message}
                </Typography>
              )}

              <Controller
                control={control}
                name="salary"
                render={({ field }) => (
                  <Input
                    label="Salary *"
                    placeholder="Enter salary"
                    keyboardType="decimal-pad"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.salary?.message}
                  />
                )}
              />

              {isEditMode && (
                <>
                  <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                    Status
                  </Typography>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.base }}>
                    {[
                      { label: 'Active', value: true },
                      { label: 'Inactive', value: false },
                    ].map((option) => {
                      const isSelected = isActive === option.value;
                      return (
                        <TouchableOpacity
                          key={String(option.value)}
                          activeOpacity={0.8}
                          onPress={() => setValue('isActive', option.value, { shouldValidate: true })}
                          style={{
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: theme.spacing.sm,
                            borderRadius: theme.radius.full,
                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.backgroundSecondary,
                            borderWidth: 1,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                            marginRight: theme.spacing.sm,
                            marginBottom: theme.spacing.sm,
                          }}
                        >
                          <Typography
                            variant="bodyMedium"
                            color={isSelected ? theme.colors.white : theme.colors.text}
                          >
                            {option.label}
                          </Typography>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title={isEditMode ? 'Update Staff' : 'Add Staff'}
          loading={isPending}
          disabled={isPending}
          leftIcon={<Ionicons name={isEditMode ? 'save' : 'person-add'} size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
