import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper, Header, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import {
  useCreateProperty,
  useUpdateProperty,
  useUploadPropertyImage,
  useProperty,
  useDownloadProfileImage,
} from '../../src/hooks/queries';
import { profileService } from '../../src/api/services';
import { getApiErrorMessage } from '../../src/utils/validation';
import type { Property, ProfileUploadResponse } from '../../src/types';

const SHARING_OPTIONS = [1, 2, 3, 4, 5];

const PG_TYPE_OPTIONS: { label: string; value: 'MEN' | 'LADIES' | 'CO_LIVE' }[] = [
  { label: 'Girls', value: 'LADIES' },
  { label: 'Boys', value: 'MEN' },
  { label: 'Co-Living', value: 'CO_LIVE' },
];

const schema = z
  .object({
    name: z.string().min(1, 'Hostel name is required').max(100, 'Hostel name is too long'),
    pgType: z.enum(['MEN', 'LADIES', 'CO_LIVE'], { message: 'Type of hostel is required' }),
    maxSharing: z.number().min(1, 'Select number of sharing').max(5),
    prices: z.record(z.string(), z.string()),
    advanceAmount: z
      .string()
      .min(1, 'Advance amount is required')
      .max(8, 'Advance amount is too large'),
    city: z.string().min(1, 'City is required').max(50, 'City name is too long'),
    address: z.string().min(1, 'Hostel address is required').max(200, 'Address is too long'),
    numberOfFloors: z
      .string()
      .min(1, 'Number of floors is required')
      .regex(/^[1-9][0-9]?$/, 'Enter a valid number between 1 and 99'),
  })
  .superRefine((data, ctx) => {
    SHARING_OPTIONS.forEach((n) => {
      if (n <= data.maxSharing) {
        const value = data.prices[String(n)];
        if (!value || Number(value) <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Enter price for ${n} sharing`,
            path: ['prices', String(n)],
          });
        }
      }
    });
  });

type FormData = z.infer<typeof schema>;

export default function AddPropertyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const isEditMode = !!propertyId;
  const { user } = useAuth();
  const { setSelectedPg, setPropertyImageUri, propertyImageUri } = useSelectedPg();
  const qc = useQueryClient();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const uploadPropertyImage = useUploadPropertyImage();

  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const imageInitialized = useRef(false);


  useEffect(() => {
    imageInitialized.current = false;
    setImages([]);
    setHasImageChanged(false);
  }, [propertyId]);

  const { data: existingProperty, isLoading: propertyLoading } = useProperty(propertyId);
  const { data: propertyImageDownload } = useDownloadProfileImage(
    propertyId,
    'PG',
    'profiles',
    { enabled: isEditMode }
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      pgType: 'MEN',
      maxSharing: 3,
      prices: Object.fromEntries(SHARING_OPTIONS.map((n) => [String(n), ''])),
    },
  });

  const maxSharing = watch('maxSharing');
  const prices = watch('prices');

  useEffect(() => {
    if (!existingProperty) return;

    const max = SHARING_OPTIONS.reduce(
      (acc, n) => ((existingProperty as any)[`sharing${n}`] > 0 ? n : acc),
      0
    );
    const prefilledPrices: Record<string, string> = {};
    SHARING_OPTIONS.forEach((n) => {
      if (n <= max) {
        const val = (existingProperty as any)[`sharing${n}`];
        if (val) prefilledPrices[String(n)] = String(val);
      }
    });

    reset({
      name: existingProperty.name,
      pgType: existingProperty.pgType,
      maxSharing: max || 1,
      prices: prefilledPrices,
      advanceAmount: String(existingProperty.advanceAmount ?? ''),
      city: existingProperty.city,
      address: existingProperty.address,
      numberOfFloors: String(existingProperty.numberOfFloors ?? ''),
    });

    const imageUrl = propertyImageDownload?.presignedUrl;
    if (imageUrl && !imageInitialized.current) {
      imageInitialized.current = true;
      setImages([
        {
          uri: imageUrl,
          fileName: 'property.jpg',
          mimeType: 'image/jpeg',
        } as ImagePicker.ImagePickerAsset,
      ]);
      // Only seed the context if no uploaded/picked URI is already present.
      if (!propertyImageUri) {
        setPropertyImageUri(imageUrl);
      }
    }
  }, [existingProperty, propertyImageDownload?.presignedUrl, reset, setPropertyImageUri, propertyImageUri]);

  const toggleSharing = (n: number) => {
    setValue('maxSharing', n, { shouldValidate: false });
  };

  const updatePrice = (sharing: number, value: string) => {
    const next = { ...prices, [String(sharing)]: value.replace(/[^0-9]/g, '') };
    setValue('prices', next, { shouldValidate: true });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newAssets = result.assets.slice(0, 5);
      setImages((prev) => {
        const combined = [...prev, ...newAssets].slice(0, 5);
        if (combined[0]) {
          setPropertyImageUri(combined[0].uri);
        }
        return combined;
      });
      setHasImageChanged(true);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next[0]) {
        setPropertyImageUri(next[0].uri);
      } else {
        setPropertyImageUri('');
      }
      return next;
    });
    setHasImageChanged(true);
  };

  const buildPayload = (data: FormData): Omit<Property, 'id' | 'createdAt' | 'updatedAt'> => {
    const payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      address: data.address,
      city: data.city,
      ownerId: user?.id || '',
      pgType: data.pgType,
      advanceAmount: Number(data.advanceAmount) || 0,
      numberOfFloors: Number(data.numberOfFloors),
    };

    SHARING_OPTIONS.forEach((n) => {
      const key = `sharing${n}` as keyof typeof payload;
      if (n <= data.maxSharing && data.prices[String(n)]) {
        (payload as any)[key] = Number(data.prices[String(n)]);
      } else {
        (payload as any)[key] = 0;
      }
    });

    return payload;
  };

  const onSubmit = async (data: FormData) => {
    const payload = buildPayload(data);

    try {
      let targetPropertyId = propertyId;

      if (isEditMode) {
        await updateProperty.mutateAsync({ id: propertyId, payload: payload as Partial<Property> });
      } else {
        const property = await createProperty.mutateAsync(payload);
        setSelectedPg(property);
        targetPropertyId = property.id;
      }

      if (images.length > 0 && (!isEditMode || hasImageChanged) && targetPropertyId) {
        try {
          let lastUploadResponse: ProfileUploadResponse | undefined;
          for (const img of images) {
            lastUploadResponse = await uploadPropertyImage.mutateAsync({
              id: targetPropertyId,
              file: {
                uri: img.uri,
                name: img.fileName || 'property.jpg',
                type: img.mimeType || 'image/jpeg',
              },
            });
          }

          // Fetch the latest presigned URL (with cache-buster) so the image is
          // reflected immediately in HeroHeader.
          const downloadKey = ['profiles', 'download', 'profiles', 'PG', targetPropertyId];
          await qc.invalidateQueries({ queryKey: downloadKey });
          const downloadData = await qc.fetchQuery({
            queryKey: downloadKey,
            queryFn: () => profileService.download(targetPropertyId, 'PG', 'profiles'),
          });
          const presignedUrl = downloadData?.presignedUrl;

          if (presignedUrl) {
            const separator = presignedUrl.includes('?') ? '&' : '?';
            setPropertyImageUri(`${presignedUrl}${separator}t=${Date.now()}`);
          } else if (lastUploadResponse?.objectUrl) {
            setPropertyImageUri(lastUploadResponse.objectUrl);
          }
        } catch (uploadErr: any) {
          console.warn('Property image upload failed:', uploadErr);
          Alert.alert(
            'Image upload failed',
            uploadErr?.message || 'The property image could not be saved. Please try again.'
          );
        }
      }

      if (isEditMode) {
        router.replace({ pathname: '/screens/property-details', params: { id: targetPropertyId } });
      } else {
        router.replace({ pathname: '/screens/assign-manager' });
      }
    } catch {
      // error surfaced by mutation
    }
  };

  const isPending =
    createProperty.isPending || updateProperty.isPending || uploadPropertyImage.isPending;
  const error =
    (createProperty.error as any) || (updateProperty.error as any) || (uploadPropertyImage.error as any);

  if (isEditMode && propertyLoading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body" color={theme.colors.textMuted}>
            Loading property details...
          </Typography>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Header
        title={isEditMode ? 'Edit Property' : 'Add Property'}
        subtitle={isEditMode ? 'Update property details' : 'Please provide property details'}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)')
        }
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        style={{ paddingVertical: theme.spacing.lg }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
        >
          <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
            <Typography variant="title1" color={theme.colors.primary} style={{ marginBottom: theme.spacing.md }}>
              Basic Details
            </Typography>

            <Card shadow="lg" padding={theme.spacing.lg}>
              {/* Hostel Name */}
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <Input
                    label="Hostel Name"
                    placeholder="Enter hostel name"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.name?.message}
                  />
                )}
              />

              {/* Type of Hostel */}
              <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                Type of Hostel
              </Typography>
              <Controller
                control={control}
                name="pgType"
                render={({ field }) => (
                  <View style={{ flexDirection: 'row', marginBottom: theme.spacing.base }}>
                    {PG_TYPE_OPTIONS.map((option, index) => {
                      const isSelected = field.value === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          activeOpacity={0.8}
                          onPress={() => field.onChange(option.value)}
                          style={{
                            flex: 1,
                            height: 44,
                            marginRight: index < PG_TYPE_OPTIONS.length - 1 ? theme.spacing.sm : 0,
                            borderRadius: theme.radius.full,
                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.backgroundSecondary,
                            borderWidth: 1,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                            alignItems: 'center',
                            justifyContent: 'center',
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
                )}
              />
              {errors.pgType && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  {errors.pgType.message}
                </Typography>
              )}

              {/* Number of Sharing */}
              <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                Number of Sharing
              </Typography>
              <Controller
                control={control}
                name="maxSharing"
                render={() => (
                  <View style={{ flexDirection: 'row', marginBottom: theme.spacing.base }}>
                    {SHARING_OPTIONS.map((n) => {
                      const isSelected = n <= maxSharing;
                      return (
                        <TouchableOpacity
                          key={n}
                          activeOpacity={0.8}
                          onPress={() => toggleSharing(n)}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: theme.radius.lg,
                            backgroundColor: isSelected ? theme.colors.primary : theme.colors.white,
                            borderWidth: 1,
                            borderColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: theme.spacing.sm,
                          }}
                        >
                          <Typography variant="bodyMedium" color={isSelected ? theme.colors.white : theme.colors.text}>
                            {n}
                          </Typography>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />

              {/* Price details */}
              <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                Enter price details
              </Typography>
              {SHARING_OPTIONS.filter((n) => n <= maxSharing).map((n) => {
                const priceError = errors.prices?.[String(n)]?.message;
                return (
                  <View
                    key={n}
                    style={{
                      borderWidth: 1,
                      borderColor: priceError ? theme.colors.danger : theme.colors.borderLight,
                      borderRadius: theme.radius.lg,
                      backgroundColor: theme.colors.backgroundSecondary,
                      paddingHorizontal: theme.spacing.md,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 52,
                        paddingVertical: theme.spacing.sm,
                      }}
                    >
                      <Typography variant="bodyMedium" style={{ width: 90 }}>
                        {n} Sharing
                      </Typography>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Typography variant="bodyMedium" color={theme.colors.textMuted} style={{ alignSelf: 'center' }}>
                          ₹
                        </Typography>
                        <TextInput
                          value={prices[String(n)] || ''}
                          onChangeText={(v) => updatePrice(n, v)}
                          keyboardType="number-pad"
                          maxLength={6}
                          placeholder="Enter price"
                          placeholderTextColor={theme.colors.placeholder}
                          style={{
                            flex: 1,
                            fontFamily: theme.fontFamilies.primary,
                            fontSize: theme.fontSizes.base,
                            color: theme.colors.text,
                            marginHorizontal: theme.spacing.xs,
                            textAlign: 'right',
                            minWidth: 60,
                          }}
                        />
                        <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: theme.spacing.xs, alignSelf: 'center', minWidth: 42 }}>
                          /month
                        </Typography>
                      </View>
                    </View>
                    {priceError && (
                      <Typography variant="caption" color={theme.colors.danger} style={{ marginBottom: theme.spacing.xs }}>
                        {priceError}
                      </Typography>
                    )}
                  </View>
                );
              })}
              {errors.prices && !Object.values(errors.prices).some((e) => e?.message) && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginBottom: theme.spacing.sm }}>
                  Please enter prices for all selected sharing options
                </Typography>
              )}

              {/* Advance Amount */}
              <Typography variant="bodyMedium" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
                Advance Amount
              </Typography>
              <Typography variant="caption" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.md }}>
                Security deposit collected from tenants
              </Typography>
              <Controller
                control={control}
                name="advanceAmount"
                render={({ field }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 52,
                      borderRadius: theme.radius.lg,
                      backgroundColor: theme.colors.backgroundSecondary,
                      paddingHorizontal: theme.spacing.md,
                      borderWidth: 1,
                      borderColor: errors.advanceAmount ? theme.colors.danger : theme.colors.borderLight,
                    }}
                  >
                    <Typography variant="bodyMedium" color={theme.colors.textMuted} style={{ marginRight: theme.spacing.sm }}>
                      ₹
                    </Typography>
                    <TextInput
                      value={field.value}
                      onChangeText={(v) => field.onChange(v.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={8}
                      placeholder="Enter advance amount"
                      placeholderTextColor={theme.colors.placeholder}
                      style={{
                        flex: 1,
                        fontFamily: theme.fontFamilies.primary,
                        fontSize: theme.fontSizes.base,
                        color: theme.colors.text,
                      }}
                    />
                  </View>
                )}
              />
              {errors.advanceAmount && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.xs }}>
                  {errors.advanceAmount.message}
                </Typography>
              )}

              {/* Extra required fields */}
              <View style={{ marginTop: theme.spacing.lg }}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <Input label="City" placeholder="Enter city" maxLength={50} value={field.value} onChangeText={field.onChange} error={errors.city?.message} />
                  )}
                />
                <Controller
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <Input
                      label="Hostel Address"
                      placeholder="Enter hostel address"
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.address?.message}
                      inputStyle={{ height: 80, textAlignVertical: 'top' }}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="numberOfFloors"
                  render={({ field }) => (
                    <Input
                      label="Number of Floors"
                      placeholder="Enter number of floors"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.numberOfFloors?.message}
                    />
                  )}
                />

                <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>
                  Upload Hostel Images
                </Typography>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ alignItems: 'center', paddingVertical: theme.spacing.xs }}
                >
                  {images.map((img, index) => (
                    <View
                      key={`${img.uri}-${index}`}
                      style={{
                        width: 120,
                        height: 120,
                        marginRight: theme.spacing.sm,
                        borderRadius: theme.radius.md,
                        overflow: 'hidden',
                        backgroundColor: theme.colors.backgroundSecondary,
                      }}
                    >
                      <Image
                        source={{ uri: img.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="close" size={16} color={theme.colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {images.length < 5 && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={pickImage}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: theme.radius.md,
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        borderColor: theme.colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.colors.backgroundSecondary,
                      }}
                    >
                      <Ionicons name="cloud-upload-outline" size={28} color={theme.colors.primary} />
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.xs }}>
                        Add image
                      </Typography>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>

              {error && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                  {getApiErrorMessage(error, isEditMode ? 'Failed to update property' : 'Failed to save property')}
                </Typography>
              )}
            </Card>
          </View>

          <View style={{ padding: theme.spacing.base }}>
            <Button title={isEditMode ? 'Save Changes' : 'Next'} loading={isPending} onPress={handleSubmit(onSubmit)} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
