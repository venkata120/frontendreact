import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Input, Button, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useCreateExpense, useExpenseMasters } from '../../src/hooks/queries';
import { useAuth } from '../../src/hooks/useAuth';
import { useMemo, useState } from 'react';
import { regex, messages, getApiErrorMessage } from '../../src/utils/validation';

const schema = z.object({
  amount: z.string().min(1, messages.required('Amount')).regex(regex.digitsOnly, 'Amount must be a valid number'),
  expenseMonth: z
    .string()
    .min(1, messages.required('Month'))
    .regex(/^\d{2}$/, 'Month must be 2 digits')
    .refine((v) => {
      const n = Number(v);
      return n >= 1 && n <= 12;
    }, 'Month must be between 01 and 12'),
  expenseYear: z
    .string()
    .min(1, messages.required('Year'))
    .regex(/^\d{4}$/, 'Year must be 4 digits'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddExpenseScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPgId } = useSelectedPg();
  const createExpense = useCreateExpense();
  const { data: masters, isLoading: mastersLoading } = useExpenseMasters();
  const { user } = useAuth();
  const [masterModalVisible, setMasterModalVisible] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<string>('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      expenseMonth: new Date().toISOString().slice(5, 7),
      expenseYear: String(new Date().getFullYear()),
    },
  });

  const masterOptions = useMemo(() => {
    if (!masters) return [];
    return masters.filter((m) => m.isActive).map((m) => ({ label: m.categoryName, value: m.id }));
  }, [masters]);

  const selectedMaster = useMemo(() => masterOptions.find((m) => m.value === selectedMasterId), [masterOptions, selectedMasterId]);

  const onSubmit = async (data: FormData) => {
    if (!selectedPgId) return;
    if (!selectedMasterId) {
      Alert.alert('Category required', 'Please select an expense category');
      return;
    }
    try {
      await createExpense.mutateAsync({
        pgPropertyId: selectedPgId,
        expenseMasterId: selectedMasterId,
        amount: Number(data.amount),
        expenseMonth: data.expenseMonth,
        expenseYear: Number(data.expenseYear),
        notes: data.notes,
        createdBy: user?.id || '',
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Failed to add expense'));
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
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>Add Expense</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg}>
            <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>Category *</Typography>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMasterModalVisible(true)}
              style={{
                borderWidth: 1,
                borderColor: !selectedMasterId ? theme.colors.danger : theme.colors.border,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.md,
              }}
            >
              <Typography variant="bodyMedium" color={selectedMaster ? theme.colors.text : theme.colors.textMuted}>
                {selectedMaster ? selectedMaster.label : (mastersLoading ? 'Loading categories...' : 'Select category')}
              </Typography>
              <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
            {!selectedMasterId && (
              <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: -theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                Category is required
              </Typography>
            )}

            <Controller control={control} name="amount" render={({ field }) => (
              <Input label="Amount *" placeholder="Enter amount" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.amount?.message} leftIcon="cash-outline" />
            )} />
            <Controller control={control} name="expenseMonth" render={({ field }) => (
              <Input label="Month (MM) *" placeholder="MM" maxLength={2} value={field.value} onChangeText={field.onChange} error={errors.expenseMonth?.message} leftIcon="calendar-outline" />
            )} />
            <Controller control={control} name="expenseYear" render={({ field }) => (
              <Input label="Year (YYYY) *" placeholder="YYYY" maxLength={4} keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.expenseYear?.message} leftIcon="calendar-outline" />
            )} />
            <Controller control={control} name="notes" render={({ field }) => (
              <Input label="Notes" placeholder="Enter notes" value={field.value} onChangeText={field.onChange} error={errors.notes?.message} leftIcon="document-text-outline" />
            )} />
          </Card>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Add Expense"
          loading={createExpense.isPending}
          leftIcon={<Ionicons name="add-circle" size={20} color={theme.colors.white} />}
          onPress={handleSubmit(onSubmit)}
        />
      </View>

      <Modal visible={masterModalVisible} transparent animationType="slide" onRequestClose={() => setMasterModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, paddingBottom: 24, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.base, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
              <Typography variant="title1">Select Category</Typography>
              <TouchableOpacity onPress={() => setMasterModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {masterOptions.length === 0 ? (
              <View style={{ padding: theme.spacing.xl, alignItems: 'center' }}>
                <Typography variant="body" color={theme.colors.textMuted}>No categories available</Typography>
              </View>
            ) : (
              <FlatList
                data={masterOptions}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedMasterId(item.value);
                      setMasterModalVisible(false);
                    }}
                    style={{
                      padding: theme.spacing.base,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.borderLight,
                      backgroundColor: item.value === selectedMasterId ? theme.colors.primarySurface : theme.colors.white,
                    }}
                  >
                    <Typography variant="bodyMedium" color={item.value === selectedMasterId ? theme.colors.primary : theme.colors.text}>{item.label}</Typography>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
