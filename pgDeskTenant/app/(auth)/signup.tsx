import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScreenWrapper, Typography, Button, Input, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentPhone: z.string().min(10, 'Enter a valid phone number'),
  dob: z.string().min(1, 'Date of birth is required'),
  aadhaar: z.string().min(12, 'Enter valid Aadhaar number'),
  location: z.string().min(1, 'Location is required'),
});

type FormData = z.infer<typeof schema>;

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    router.push({ pathname: '/(auth)/otp', params: { phone: data.phone } });
  };

  return (
    <ScreenWrapper avoidKeyboard>
      <Header
        title="Register as Tenant"
        subtitle="Personal Details"
        onBack={() => router.back()}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          <Typography variant="body" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.md }}>
            Please provide basic details
          </Typography>

          <Controller control={control} name="name" render={({ field }) => (
            <Input label="Full Name *" placeholder="Enter full name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
          )} />
          <Controller control={control} name="phone" render={({ field }) => (
            <Input label="Mobile Number *" placeholder="Enter mobile number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />
          )} />
          <Controller control={control} name="parentName" render={({ field }) => (
            <Input label="Parent Name *" placeholder="Enter parent name" value={field.value} onChangeText={field.onChange} error={errors.parentName?.message} />
          )} />
          <Controller control={control} name="parentPhone" render={({ field }) => (
            <Input label="Parent Mobile Number" placeholder="Enter parent mobile number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.parentPhone?.message} />
          )} />
          <Controller control={control} name="dob" render={({ field }) => (
            <Input label="Date of Birth *" placeholder="DD/MM/YYYY" value={field.value} onChangeText={field.onChange} error={errors.dob?.message} leftIcon="calendar-outline" />
          )} />
          <Controller control={control} name="aadhaar" render={({ field }) => (
            <Input label="Adhaar Number *" placeholder="Enter Aadhaar number" keyboardType="number-pad" maxLength={14} value={field.value} onChangeText={field.onChange} error={errors.aadhaar?.message} />
          )} />
          <Controller control={control} name="location" render={({ field }) => (
            <Input label="Location *" placeholder="Enter location" value={field.value} onChangeText={field.onChange} error={errors.location?.message} />
          )} />
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button title="Next" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScreenWrapper>
  );
}
