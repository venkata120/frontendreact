import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  ActionSheetIOS,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { ScreenWrapper, Typography, Input, Button, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant } from '../../src/context/TenantContext';
import { useTenantDetails } from '../../src/hooks/queries/useTenant';
import { useUpdateTenant } from '../../src/hooks/queries/useUpdateTenant';
import { profileService } from '../../src/services/profile';
import type { Tenant } from '../../src/types';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  name: z.string().min(2, 'Full name is required').max(50, 'Name is too long'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  parentName: z.string().min(2, 'Parent name is required').max(50, 'Parent name is too long'),
  parentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { tenantId } = useTenant();
  const { data: tenantDetails, isLoading, refetch } = useTenantDetails(tenantId ?? undefined);
  const updateTenant = useUpdateTenant();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const initialValuesRef = useRef<FormData | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      parentName: '',
      parentPhone: '',
    },
  });

  useEffect(() => {
    if (tenantDetails) {
      const initial = {
        name: tenantDetails.fullName || '',
        phone: tenantDetails.phone?.replace(/\D/g, '').slice(-10) || '',
        parentName: tenantDetails.parentName || '',
        parentPhone: tenantDetails.parentPhone?.replace(/\D/g, '').slice(-10) || '',
      };
      reset(initial);
      initialValuesRef.current = initial;
      setPhotoUri(tenantDetails.avatar || null);
    }
  }, [tenantDetails, reset]);

  const uploadSelectedPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!tenantId) return;
    setPhotoUri(asset.uri);
    setUploadingPhoto(true);
    try {
      const uploadRes = await profileService.upload(
        {
          uri: asset.uri,
          name: asset.fileName || 'profile.jpg',
          type: asset.mimeType || 'image/jpeg',
        },
        'TENANT',
        tenantId,
        'profiles'
      );
      setPhotoUri(uploadRes.objectUrl);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const launchGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to photos to update your profile image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadSelectedPhoto(result.assets[0]);
    }
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access to retake your profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadSelectedPhoto(result.assets[0]);
    }
  };

  const pickImage = async () => {
    if (!tenantId) {
      Alert.alert('Error', 'Tenant ID is missing');
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await launchCamera();
          else if (buttonIndex === 2) await launchGallery();
        }
      );
    } else {
      Alert.alert('Update Profile Photo', 'Choose an option', [
        { text: 'Take Photo', onPress: launchCamera },
        { text: 'Choose from Library', onPress: launchGallery },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!tenantId) return;

    const initial = initialValuesRef.current;
    const payload: Partial<Tenant> = {};

    if (!initial || data.name !== initial.name) payload.fullName = data.name;
    if (!initial || data.phone !== initial.phone) payload.phone = `+91${data.phone}`;
    if (!initial || data.parentName !== initial.parentName) payload.parentName = data.parentName;
    if (!initial || data.parentPhone !== initial.parentPhone) payload.parentPhone = `+91${data.parentPhone}`;
    if (photoUri && photoUri !== tenantDetails?.avatar) payload.avatar = photoUri;

    if (Object.keys(payload).length === 0) {
      Alert.alert('No changes', 'No profile changes to save.');
      return;
    }

    try {
      await updateTenant.mutateAsync({ id: tenantId, payload });
      await refetch();
      Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to update profile');
    }
  };

  return (
    <ScreenWrapper
      scrollRef={scrollRef}
      scrollable
      avoidKeyboard
      scrollProps={{ contentContainerStyle: { flexGrow: 1, paddingBottom: theme.spacing['3xl'] } }}
    >
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
            onPress={() => router.back()}
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

      <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base, paddingBottom: theme.spacing.base, flex: 1 }}>
        <Card shadow="lg" padding={theme.spacing.lg}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Ionicons name="person" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Typography variant="title1">Personal information</Typography>
          </View>

          <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>Profile photo</Typography>
          <View
            style={{
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              alignItems: 'center',
              marginBottom: theme.spacing.lg,
            }}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            ) : (
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.colors.primarySurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person" size={40} color={theme.colors.primary} />
              </View>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickImage}
              disabled={uploadingPhoto}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
                paddingVertical: 10,
                paddingHorizontal: theme.spacing.xl,
                marginTop: theme.spacing.md,
                opacity: uploadingPhoto ? 0.7 : 1,
              }}
            >
              <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>
                {uploadingPhoto ? 'Uploading...' : 'Retake Photo'}
              </Typography>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Typography variant="body" color={theme.colors.textMuted}>Loading profile...</Typography>
          ) : (
            <>
              <Controller control={control} name="name" render={({ field }) => (
                <Input label="Full Name *" placeholder="Enter full name" maxLength={50} value={field.value} onChangeText={field.onChange} error={errors.name?.message} leftIcon="person-outline" />
              )} />
              <Controller control={control} name="phone" render={({ field }) => (
                <Input label="Mobile number *" placeholder="Enter mobile number" keyboardType="phone-pad" maxLength={10} value={field.value} onChangeText={(v) => field.onChange(v.replace(/[^0-9]/g, ''))} error={errors.phone?.message} leftIcon="call-outline" />
              )} />
              <Controller control={control} name="parentName" render={({ field }) => (
                <Input label="Parent Name *" placeholder="Enter parent name" maxLength={50} value={field.value} onChangeText={field.onChange} error={errors.parentName?.message} leftIcon="people-outline" />
              )} />
              <Controller control={control} name="parentPhone" render={({ field }) => (
                <Input label="Parent Mobile Number *" placeholder="Enter parent mobile" keyboardType="phone-pad" maxLength={10} value={field.value} onChangeText={(v) => field.onChange(v.replace(/[^0-9]/g, ''))} error={errors.parentPhone?.message} leftIcon="call-outline" onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })} />
              )} />
            </>
          )}

          <View style={{ paddingTop: theme.spacing.md }}>
            <Button
              title="Save Changes"
              loading={updateTenant.isPending}
              disabled={updateTenant.isPending || isLoading || uploadingPhoto}
              leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}
