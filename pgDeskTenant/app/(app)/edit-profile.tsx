import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
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
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  name: z.string().min(2, 'Full name is required').max(50, 'Name is too long'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  parentName: z.string().min(2, 'Parent name is required').max(50, 'Parent name is too long'),
  parentPhone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { tenantId } = useTenant();
  const { data: tenantDetails, isLoading } = useTenantDetails(tenantId ?? undefined);
  const updateTenant = useUpdateTenant();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

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
      reset({
        name: tenantDetails.fullName || '',
        phone: tenantDetails.phone?.replace(/\D/g, '').slice(-10) || '',
        parentName: tenantDetails.parentName || '',
        parentPhone: tenantDetails.parentPhone?.replace(/\D/g, '').slice(-10) || '',
      });
      setPhotoUri(tenantDetails.avatar || null);
    }
  }, [tenantDetails, reset]);

  const pickImage = async () => {
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
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!tenantId) return;
    try {
      const payload: Partial<typeof tenantDetails> = {
        fullName: data.name,
        phone: `+91${data.phone}`,
        parentName: data.parentName,
        parentPhone: `+91${data.parentPhone}`,
        avatar: photoUri || undefined,
      };
      await updateTenant.mutateAsync({ id: tenantId, payload });
      Alert.alert('Success', 'Profile updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to update profile');
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base }}>
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
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radius.full,
                    paddingVertical: 10,
                    paddingHorizontal: theme.spacing.xl,
                    marginTop: theme.spacing.md,
                  }}
                >
                  <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>Retake Photo</Typography>
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
                    <Input label="Parent Mobile Number *" placeholder="Enter parent mobile" keyboardType="phone-pad" maxLength={10} value={field.value} onChangeText={(v) => field.onChange(v.replace(/[^0-9]/g, ''))} error={errors.parentPhone?.message} leftIcon="call-outline" />
                  )} />
                </>
              )}
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ padding: theme.spacing.base, borderTopWidth: 1, borderTopColor: theme.colors.borderLight, backgroundColor: theme.colors.background }}>
        <Button
          title="Save Changes"
          loading={updateTenant.isPending}
          disabled={updateTenant.isPending || isLoading}
          leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
