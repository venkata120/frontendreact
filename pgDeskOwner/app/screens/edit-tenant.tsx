import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Input, Button, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant, useUpdateTenant } from '../../src/hooks/queries';
import { useEffect } from 'react';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  emergencyContact: z.string().optional().or(z.literal('')),
  rentPerMonth: z.string().min(1, 'Rent is required'),
});

type FormData = z.infer<typeof schema>;

export default function EditTenantScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tenant, isLoading } = useTenant(id);
  const updateTenant = useUpdateTenant();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

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
    await updateTenant.mutateAsync({
      id,
      payload: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        emergencyContact: data.emergencyContact,
        rentPerMonth: Number(data.rentPerMonth),
      },
    });
    router.back();
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
          <Typography variant="headline2" color={theme.colors.white}>Edit Tenant Details</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="person" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title1">Personal information</Typography>
            </View>

            <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <Avatar size={100} uri="" name={tenant?.fullName} />
            </View>

            {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

            <Controller control={control} name="fullName" render={({ field }) => (
              <Input label="Full Name *" placeholder="Enter full name" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} leftIcon="person-outline" />
            )} />
            <Controller control={control} name="phone" render={({ field }) => (
              <Input label="Mobile number *" placeholder="Enter mobile number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} leftIcon="call-outline" />
            )} />
            <Controller control={control} name="email" render={({ field }) => (
              <Input label="Email" placeholder="Enter email" keyboardType="email-address" value={field.value} onChangeText={field.onChange} error={errors.email?.message} leftIcon="mail-outline" />
            )} />
            <Controller control={control} name="emergencyContact" render={({ field }) => (
              <Input label="Emergency Contact" placeholder="Enter emergency contact" value={field.value} onChangeText={field.onChange} error={errors.emergencyContact?.message} leftIcon="people-outline" />
            )} />
            <Controller control={control} name="rentPerMonth" render={({ field }) => (
              <Input label="Rent Per Month *" placeholder="Enter rent" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.rentPerMonth?.message} leftIcon="cash-outline" />
            )} />
          </Card>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Save Changes"
          loading={updateTenant.isPending}
          leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
