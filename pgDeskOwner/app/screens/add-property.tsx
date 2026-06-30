import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper, Header, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useProperty, useCreateProperty, useUpdateProperty } from '../../src/hooks/queries';
import { useEffect, useState } from 'react';
import { regex, messages, getApiErrorMessage } from '../../src/utils/validation';

const MAX_CITY_LENGTH = 50;
const MAX_FLOORS = 50;

const schema = z.object({
  name: z.string().min(1, messages.required('Hostel Name')).max(100, 'Hostel name is too long'),
  pgType: z.string().min(1, messages.required('Type of Hostel')),
  city: z
    .string()
    .min(1, messages.required('City'))
    .max(MAX_CITY_LENGTH, `City must not exceed ${MAX_CITY_LENGTH} characters`)
    .regex(regex.alphabetsOnly, 'City should contain only alphabets and spaces'),
  address: z.string().min(1, messages.required('Hostel Address')).max(200, 'Address is too long'),
  numberOfFloors: z
    .string()
    .min(1, messages.required('Number of Floors'))
    .regex(regex.positiveInteger, 'Number of Floors must be a valid number')
    .refine((v) => Number(v) > 0 && Number(v) <= MAX_FLOORS, `Number of Floors must be between 1 and ${MAX_FLOORS}`),
});

type FormData = z.infer<typeof schema>;

const PG_TYPES = [
  { label: 'Men', value: 'MEN' },
  { label: 'Ladies', value: 'LADIES' },
  { label: 'Co-Live', value: 'CO_LIVE' },
];

export default function AddPropertyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { selectedPg, setSelectedPg } = useSelectedPg();
  const { data: existing } = useProperty(id);
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const [pgTypeModalOpen, setPgTypeModalOpen] = useState(false);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pgType: 'MEN' },
  });

  const selectedPgType = watch('pgType');

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        pgType: existing.pgType,
        city: existing.city,
        address: existing.address,
        numberOfFloors: existing.numberOfFloors ? String(existing.numberOfFloors) : '',
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
      numberOfFloors: Number(data.numberOfFloors),
    };
    try {
      if (id) {
        await updateProperty.mutateAsync({ id, payload });
      } else {
        const created = await createProperty.mutateAsync(payload);
        if (!selectedPg) setSelectedPg(created);
      }
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)');
      }
    } catch {
      // error surfaced by mutation
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      setImages((prev) => [...prev, ...result.assets]);
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
            <Typography variant="title1" color={theme.colors.primary} style={{ marginBottom: theme.spacing.md }}>
              Basic Details
            </Typography>

            <Card shadow="lg" padding={theme.spacing.lg}>
              <Controller control={control} name="name" render={({ field }) => (
                <Input label="Hostel Name *" placeholder="Enter hostel name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
              )} />
              <Controller control={control} name="pgType" render={({ field }) => (
                <View>
                  <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>Type of Hostel *</Typography>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPgTypeModalOpen(true)}
                    style={{
                      minHeight: 52,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: theme.spacing.md,
                      borderRadius: theme.radius.lg,
                      backgroundColor: theme.colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: errors.pgType ? theme.colors.danger : theme.colors.borderLight,
                      marginBottom: theme.spacing.base,
                    }}
                  >
                    <Typography variant="bodyMedium" color={selectedPgType ? theme.colors.text : theme.colors.placeholder}>
                      {PG_TYPES.find((t) => t.value === selectedPgType)?.label || 'Select type of hostel'}
                    </Typography>
                    <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  {errors.pgType?.message && (
                    <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                      {errors.pgType.message}
                    </Typography>
                  )}
                </View>
              )} />
              <Controller control={control} name="city" render={({ field }) => (
                <Input label="City *" placeholder="Enter city" maxLength={MAX_CITY_LENGTH} value={field.value} onChangeText={field.onChange} error={errors.city?.message} />
              )} />
              <Controller control={control} name="address" render={({ field }) => (
                <Input label="Hostel Address *" placeholder="Enter hostel address" multiline numberOfLines={3} inputStyle={{ height: 80, textAlignVertical: 'top' }} value={field.value} onChangeText={field.onChange} error={errors.address?.message} />
              )} />
              <Controller control={control} name="numberOfFloors" render={({ field }) => (
                <Input label="Number of Floors *" placeholder="Enter number of floors" keyboardType="number-pad" maxLength={2} value={field.value} onChangeText={field.onChange} error={errors.numberOfFloors?.message} />
              )} />
              <Typography variant="bodyMedium" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                Upload Hostel images
              </Typography>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickImages}
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

              {images.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.md }}>
                  {images.map((img, idx) => (
                    <View key={idx} style={{ marginRight: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                      <Image source={{ uri: img.uri }} style={{ width: 64, height: 64, borderRadius: theme.radius.md }} />
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {error && (
              <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                {getApiErrorMessage(error, 'Failed to save property')}
              </Typography>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title={id ? 'Save Changes' : 'Add Property'}
          loading={isPending}
          leftIcon={<Ionicons name={id ? 'checkmark-circle' : 'add-circle'} size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <Modal visible={pgTypeModalOpen} transparent animationType="slide" onRequestClose={() => setPgTypeModalOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.base, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
              <Typography variant="title1">Select Type of Hostel</Typography>
              <TouchableOpacity onPress={() => setPgTypeModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={PG_TYPES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setValue('pgType', item.value, { shouldValidate: true });
                    setPgTypeModalOpen(false);
                  }}
                  style={{
                    padding: theme.spacing.base,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.borderLight,
                    backgroundColor: item.value === selectedPgType ? theme.colors.primarySurface : theme.colors.white,
                  }}
                >
                  <Typography variant="bodyMedium" color={item.value === selectedPgType ? theme.colors.primary : theme.colors.text}>{item.label}</Typography>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
