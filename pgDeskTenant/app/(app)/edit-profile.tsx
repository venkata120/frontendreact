import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenWrapper, Typography, Input, Button, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Phone is required'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentPhone: z.string().min(10, 'Parent phone is required'),
});

type FormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: 'Raj Kumar',
      phone: '987654321',
      parentName: 'Satyanarayana',
      parentPhone: '9876543210',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
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

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
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
              <Avatar size={100} uri="https://i.pravatar.cc/150?u=tenant" name="Raj Kumar" />
              <TouchableOpacity
                activeOpacity={0.8}
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

            <Controller control={control} name="name" render={({ field }) => (
              <Input label="Full Name *" placeholder="Enter full name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} leftIcon="person-outline" />
            )} />
            <Controller control={control} name="phone" render={({ field }) => (
              <Input label="Mobile number *" placeholder="Enter mobile number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} leftIcon="call-outline" />
            )} />
            <Controller control={control} name="parentName" render={({ field }) => (
              <Input label="Parent Name *" placeholder="Enter parent name" value={field.value} onChangeText={field.onChange} error={errors.parentName?.message} leftIcon="people-outline" />
            )} />
            <Controller control={control} name="parentPhone" render={({ field }) => (
              <Input label="Parent Mobile Number *" placeholder="Enter parent mobile" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.parentPhone?.message} leftIcon="call-outline" />
            )} />
          </Card>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Save Changes"
          leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
