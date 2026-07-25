import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Typography,
  Input,
  Button,
  Card,
  ProfileImagePicker,
  type ProfileImagePickerRef,
  ScreenHeader,
} from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant, useUpdateTenant } from '../../src/hooks/queries';
import { useEffect, useRef } from 'react';
import { regex, messages, normalizeMobile, getApiErrorMessage } from '../../src/utils/validation';

const schema = z.object({
  fullName: z.string().min(1, messages.required('Full Name')).regex(regex.alphabetsOnly, messages.alphabetsOnly('Full Name')),
  phone: z.string().min(1, messages.required('Mobile Number')).regex(regex.mobile, messages.validMobile('Mobile Number')),
  email: z.union([z.literal(''), z.string().regex(regex.email, messages.validEmail('Email'))]).optional(),
  emergencyContact: z.union([z.literal(''), z.string().regex(regex.mobile, messages.validMobile('Emergency Contact'))]).optional(),
  rentPerMonth: z.string().min(1, messages.required('Rent Per Month')).regex(regex.digitsOnly, 'Rent must be a valid number'),
});

type FormData = z.infer<typeof schema>;

export default function EditTenantScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tenant, isLoading } = useTenant(id);
  const updateTenant = useUpdateTenant();
  const photoPickerRef = useRef<ProfileImagePickerRef>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (tenant) {
      reset({
        fullName: tenant.fullName,
        phone: tenant.phone,
        email: tenant.email || '',
        emergencyContact: tenant.emergencyContact || '',
        rentPerMonth: String(tenant.rentPerMonth),
      });
    }
  }, [tenant, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    try {
      await updateTenant.mutateAsync({
        id,
        payload: {
          fullName: data.fullName,
          phone: normalizeMobile(data.phone),
          email: data.email,
          emergencyContact: data.emergencyContact ? normalizeMobile(data.emergencyContact) : undefined,
          rentPerMonth: Number(data.rentPerMonth),
          joinDate: tenant?.joinDate,
        },
      });
      Alert.alert('Success', 'Tenant updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Failed to update tenant'));
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Edit Tenant Details"
        backgroundColor={theme.colors.primary}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="person" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title1">Personal information</Typography>
            </View>

            <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <ProfileImagePicker
                ref={photoPickerRef}
                size={120}
                uri={tenant?.avatar}
                name={tenant?.fullName}
                profileType="TENANT"
                entityId={tenant?.id}
                onUploaded={(result) => {
                  console.log('[EditTenant] uploaded', result.objectUrl);
                }}
              />
              <View style={{ marginTop: theme.spacing.md }}>
                <Button
                  title="Retake Photo"
                  variant="outline"
                  size="sm"
                  leftIcon={<Ionicons name="camera" size={16} color={theme.colors.primary} />}
                  onPress={() => photoPickerRef.current?.pickImage()}
                  fullWidth={false}
                />
              </View>
            </View>

            {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

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
                <Input label="Mobile number *" placeholder="Enter mobile number" keyboardType="phone-pad" maxLength={10} value={field.value} onChangeText={field.onChange} error={errors.phone?.message} leftIcon="call-outline" />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input label="Email" placeholder="Enter email" keyboardType="email-address" value={field.value} onChangeText={field.onChange} error={errors.email?.message} leftIcon="mail-outline" />
              )}
            />
            <Controller
              control={control}
              name="emergencyContact"
              render={({ field }) => (
                <Input label="Emergency Contact" placeholder="Enter emergency contact" keyboardType="phone-pad" maxLength={10} value={field.value} onChangeText={field.onChange} error={errors.emergencyContact?.message} leftIcon="people-outline" />
              )}
            />
            <Controller
              control={control}
              name="rentPerMonth"
              render={({ field }) => (
                <Input label="Rent Per Month *" placeholder="Enter rent" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.rentPerMonth?.message} leftIcon="cash-outline" />
              )}
            />

            <Input
              label="Check-in Date"
              value={tenant?.joinDate || ''}
              editable={false}
              leftIcon="calendar-outline"
              inputStyle={{ color: theme.colors.textMuted }}
            />
            <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.md }}>
              Check-in date cannot be modified after tenant creation.
            </Typography>

            <Button
              title="Save Changes"
              loading={updateTenant.isPending}
              disabled={updateTenant.isPending}
              leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
              onPress={handleSubmit(onSubmit)}
            />
          </Card>
        </View>
        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </ScreenWrapper>
  );
}
