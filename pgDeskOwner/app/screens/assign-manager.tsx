import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { ScreenWrapper, Typography, Input, Button, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useCreateManager, useAssignManager } from '../../src/hooks/queries';
import { Ionicons } from '@expo/vector-icons';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Phone is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AssignManagerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPg } = useSelectedPg();
  const createManager = useCreateManager();
  const assignManager = useAssignManager();
  const qc = useQueryClient();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.id || !selectedPg?.id) return;
    try {
      const manager = await createManager.mutateAsync({
        ownerId: user.id,
        payload: {
          name: data.fullName,
          email: data.email,
          password: data.password,
          mobile: data.phone,
          role: 'manager',
          active: true,
        },
      });
      if (manager?.id) {
        await assignManager.mutateAsync({ managerId: manager.id, pgId: selectedPg.id });
      }

      // Refresh the staff/manager list so the newly added manager appears immediately
      await qc.invalidateQueries({ queryKey: ['managers'] });
      if (user?.id) {
        await qc.refetchQueries({ queryKey: ['managers', user.id] });
      }

      router.push('/screens/manager-assigned-successfully' as any);
    } catch {
      // error shown by mutation
    }
  };

  const isPending = createManager.isPending || assignManager.isPending;
  const error = (createManager.error as any) || (assignManager.error as any);

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
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)')}
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
          <View>
            <Typography variant="headline2" color={theme.colors.white}>Assign manager</Typography>
            <Typography variant="caption" color={theme.colors.white} style={{ opacity: 0.8 }}>
              Give secure access to manage this property
            </Typography>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md }}>
              <Ionicons name="person" size={20} color={theme.colors.white} />
            </View>
            <Typography variant="body" color={theme.colors.textSecondary} style={{ flex: 1 }}>
              You are creating login access for your manager. Share the credentials securely.
            </Typography>
          </View>

          <Card shadow="lg" padding={theme.spacing.lg}>
            <Typography variant="title1" color={theme.colors.secondary} style={{ marginBottom: theme.spacing.md }}>
              <Ionicons name="person" size={18} color={theme.colors.secondary} /> Manager Details
            </Typography>

            <Controller control={control} name="fullName" render={({ field }) => (
              <Input label="Full Name" placeholder="Enter manager name" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} />
            )} />
            <Controller control={control} name="phone" render={({ field }) => (
              <Input label="Phone number" placeholder="Enter phone number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />
            )} />
            <Controller control={control} name="email" render={({ field }) => (
              <Input label="Email" placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />
            )} />
            <Controller control={control} name="password" render={({ field }) => (
              <Input label="Password" placeholder="Set login password" secureTextEntry value={field.value} onChangeText={field.onChange} error={errors.password?.message} />
            )} />
            <Controller control={control} name="address" render={({ field }) => (
              <Input label="Address" placeholder="Enter address" multiline numberOfLines={3} inputStyle={{ height: 80, textAlignVertical: 'top' }} value={field.value} onChangeText={field.onChange} />
            )} />

            {error && (
              <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                {error?.response?.data?.message || error?.message || 'Failed to assign manager'}
              </Typography>
            )}
          </Card>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base, borderTopWidth: 1, borderTopColor: theme.colors.borderLight }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
          <Ionicons name="warning" size={16} color={theme.colors.warning} style={{ marginRight: 6 }} />
          <Typography variant="caption" color={theme.colors.warning}>Keep the password secure</Typography>
        </View>
        <Button
          title="Assign Manager"
          loading={isPending}
          leftIcon={<Ionicons name="lock-closed" size={18} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScreenWrapper>
  );
}
