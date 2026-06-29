import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useProperty, useCreateProperty, useUpdateProperty } from '../../src/hooks/queries';
import { useEffect } from 'react';

const schema = z.object({
  name: z.string().min(2, 'Hostel name is required'),
  pgType: z.string().min(1, 'Type is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  numberOfFloors: z.string().optional(),
  advanceAmount: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const PG_TYPES = ['MEN', 'LADIES', 'CO_LIVE'];

export default function AddPropertyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data: existing } = useProperty(id);
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pgType: 'MEN' },
  });

  const toNumber = (value?: string) => {
    const n = value ? Number(value) : NaN;
    return isNaN(n) ? undefined : n;
  };

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        pgType: existing.pgType,
        city: existing.city,
        address: existing.address,
        numberOfFloors: existing.numberOfFloors ? String(existing.numberOfFloors) : '',
        advanceAmount: existing.advanceAmount ? String(existing.advanceAmount) : '',
      });
    }
  }, [existing, reset]);

  const onSubmit = async (data: FormData) => {
    const payload = {
      name: data.name,
      address: data.address,
      city: data.city,
      ownerId: user?.id || existing?.ownerId || '',
      pgType: data.pgType.toUpperCase() as 'MEN' | 'LADIES' | 'CO_LIVE',
      numberOfFloors: toNumber(data.numberOfFloors),
      advanceAmount: toNumber(data.advanceAmount),
    };
    try {
      if (id) {
        await updateProperty.mutateAsync({ id, payload });
      } else {
        await createProperty.mutateAsync(payload);
      }
      router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)');
    } catch {
      // error surfaced by mutation
    }
  };

  const isPending = createProperty.isPending || updateProperty.isPending;
  const error = (createProperty.error as any) || (updateProperty.error as any);

  return (
    <ScreenWrapper>
      <Header
        title={id ? 'Edit Property' : 'Add Property'}
        subtitle="Please provide property details"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)')}
        backgroundColor={theme.colors.secondary}
        textColor={theme.colors.white}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          <Typography variant="title1" color={theme.colors.primary} style={{ marginBottom: theme.spacing.md }}>
            Basic Details
          </Typography>

          <Card shadow="lg" padding={theme.spacing.lg}>
            <Controller control={control} name="name" render={({ field }) => (
              <Input label="Hostel Name" placeholder="Enter hostel name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="pgType" render={({ field }) => (
              <Input label="Type of Hostel" placeholder="MEN / LADIES / CO_LIVE" value={field.value} onChangeText={field.onChange} error={errors.pgType?.message} />
            )} />
            <Controller control={control} name="city" render={({ field }) => (
              <Input label="City" placeholder="Enter city" value={field.value} onChangeText={field.onChange} error={errors.city?.message} />
            )} />
            <Controller control={control} name="address" render={({ field }) => (
              <Input label="Hostel Address" placeholder="Enter hostel address" multiline numberOfLines={3} inputStyle={{ height: 80, textAlignVertical: 'top' }} value={field.value} onChangeText={field.onChange} error={errors.address?.message} />
            )} />
            <Controller control={control} name="numberOfFloors" render={({ field }) => (
              <Input label="Number of Floors" placeholder="Enter number of floors" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} error={errors.numberOfFloors?.message} />
            )} />
            <Controller control={control} name="advanceAmount" render={({ field }) => (
              <Input label="Advance Amount" placeholder="Enter advance amount" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.advanceAmount?.message} />
            )} />

            <Typography variant="bodyMedium" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
              Upload Hostel images
            </Typography>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                padding: theme.spacing.lg,
                alignItems: 'center',
                backgroundColor: theme.colors.backgroundSecondary,
              }}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={theme.colors.primary} />
              <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                Tap to upload images
              </Typography>
            </TouchableOpacity>
          </Card>

          {error && (
            <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
              {error?.response?.data?.message || error?.message || 'Failed to save property'}
            </Typography>
          )}
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title={id ? 'Save Changes' : 'Add Property'}
          loading={isPending}
          leftIcon={<Ionicons name={id ? 'checkmark-circle' : 'add-circle'} size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
