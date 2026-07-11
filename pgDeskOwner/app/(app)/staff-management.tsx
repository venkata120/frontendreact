import { useRouter } from 'expo-router';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper, Header, Typography, Card, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone is required'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  salary: z.string().min(1, 'Salary is required'),
});

type FormData = z.infer<typeof schema>;

const STAFF_STORAGE_KEY = '@pgdesk/staff';

export default function StaffManagementScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPg } = useSelectedPg();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedPg?.id) {
      setError('Please select a property first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const existing = await AsyncStorage.getItem(STAFF_STORAGE_KEY);
      const list: (FormData & { pgId: string; id: string })[] = existing ? JSON.parse(existing) : [];
      list.push({
        id: `${Date.now()}`,
        pgId: selectedPg.id,
        ...data,
      });
      await AsyncStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
      reset();
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <Header title="Staff Management" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: theme.spacing.xl }}>
          <View style={{ padding: theme.spacing.base }}>
            <Card shadow="lg" padding={theme.spacing.lg}>
            <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Add Staff</Typography>

            <Controller control={control} name="name" render={({ field }) => (
              <Input label="Full Name" placeholder="Enter name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />
            )} />
            <Controller control={control} name="phone" render={({ field }) => (
              <Input label="Phone Number" placeholder="Enter phone" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />
            )} />
            <Controller control={control} name="role" render={({ field }) => (
              <Input label="Role" placeholder="e.g. Cook, Maid" value={field.value} onChangeText={field.onChange} error={errors.role?.message} />
            )} />
            <Controller control={control} name="department" render={({ field }) => (
              <Input label="Department" placeholder="e.g. Kitchen" value={field.value} onChangeText={field.onChange} error={errors.department?.message} />
            )} />
            <Controller control={control} name="salary" render={({ field }) => (
              <Input label="Salary" placeholder="Enter salary" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} error={errors.salary?.message} />
            )} />

            {error && (
              <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>{error}</Typography>
            )}
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Add Staff"
          loading={loading}
          leftIcon={<Ionicons name="person-add" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
