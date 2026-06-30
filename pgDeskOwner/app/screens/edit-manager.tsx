import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Input, Button, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useManagers, useUpdateManager } from '../../src/hooks/queries';
import { regex, messages, normalizeMobile, getApiErrorMessage } from '../../src/utils/validation';

const MAX_NAME_LENGTH = 50;

const schema = z.object({
  fullName: z
    .string()
    .min(1, messages.required('Full Name'))
    .regex(regex.alphabetsOnly, messages.alphabetsOnly('Full Name')),
  phone: z
    .string()
    .min(1, messages.required('Phone Number'))
    .regex(regex.mobile, messages.validMobile('Phone Number')),
  email: z
    .string()
    .min(1, messages.required('Email'))
    .regex(regex.email, messages.validEmail('Email')),
});

type FormData = z.infer<typeof schema>;

export default function EditManagerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: managers, isLoading: managersLoading } = useManagers(user?.id);
  const updateManager = useUpdateManager();

  const manager = managers?.find((m) => m.id === id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (manager) {
      reset({
        fullName: manager.name,
        phone: manager.mobile || '',
        email: manager.email,
      });
    }
  }, [manager, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    try {
      await updateManager.mutateAsync({
        id,
        payload: {
          name: data.fullName,
          mobile: normalizeMobile(data.phone),
          email: data.email,
        },
      });
      Alert.alert('Success', 'Manager details updated', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Failed to update manager'));
    }
  };

  if (!manager && !managersLoading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.base }}>
          <Typography variant="body" color={theme.colors.textMuted}>Manager not found</Typography>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: theme.spacing.md }}>
            <Typography variant="bodyMedium" color={theme.colors.primary}>Go back</Typography>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: '#0A2A5E',
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
            <Ionicons name="arrow-back" size={20} color="#0A2A5E" />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>Edit Manager</Typography>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 160 }}>
          <View style={{ padding: theme.spacing.base }}>
            <Card shadow="lg" padding={theme.spacing.lg}>
              <Controller control={control} name="fullName" render={({ field }) => (
                <Input label="Full Name *" placeholder="Enter manager name" maxLength={MAX_NAME_LENGTH} value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} />
              )} />
              <Controller control={control} name="phone" render={({ field }) => (
                <Input label="Phone Number *" placeholder="Enter phone number" keyboardType="phone-pad" maxLength={10} value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />
              )} />
              <Controller control={control} name="email" render={({ field }) => (
                <Input label="Email *" placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
              )} />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ padding: theme.spacing.base, borderTopWidth: 1, borderTopColor: theme.colors.borderLight, backgroundColor: theme.colors.background }}>
        <Button
          title="Save Changes"
          loading={updateManager.isPending}
          leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
