import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useExpensesByPg, useExpenseMasters } from '../../src/hooks/queries';
import { useMemo } from 'react';

const formatDate = (month?: string, year?: number) => {
  if (!month || !year) return '-';
  return `${month}/${year}`;
};

export default function ExpensesListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPg } = useSelectedPg();
  const { data: expenses, isLoading } = useExpensesByPg(selectedPg?.id);
  const { data: expenseMasters } = useExpenseMasters();

  const masterNameById = useMemo(() => {
    const map = new Map<string, string>();
    expenseMasters?.forEach((m) => map.set(m.id, m.categoryName));
    return map;
  }, [expenseMasters]);

  const totalExpenses = useMemo(
    () => (expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
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
        <Typography variant="headline2" color={theme.colors.white}>Expenses</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="md" padding={theme.spacing.lg} style={{ backgroundColor: theme.colors.primary, marginVertical: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>
                  Total Expenses
                </Typography>
                <Typography variant="headline1" color={theme.colors.white}>
                  ₹{totalExpenses.toLocaleString()}
                </Typography>
                <Typography variant="caption" color={theme.colors.white}>
                  {expenses?.length || 0} expense{expenses?.length === 1 ? '' : 's'}
                </Typography>
              </View>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="receipt-outline" size={28} color={theme.colors.white} />
              </View>
            </View>
          </Card>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading expenses...</Typography>}

          {!isLoading && expenses && expenses.length > 0 ? (
            expenses.map((expense) => {
              const categoryName = masterNameById.get(expense.expenseMasterId || '') || 'Expense';
              return (
                <Card key={expense.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                      <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                        {categoryName}
                      </Typography>
                      {expense.customSubcategoryName && (
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          {expense.customSubcategoryName}
                        </Typography>
                      )}
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                        {formatDate(expense.expenseMonth, expense.expenseYear)}
                      </Typography>
                    </View>
                    <Typography variant="bodyMedium" color={theme.colors.danger} style={{ fontWeight: '600' }}>
                      ₹{expense.amount.toLocaleString()}
                    </Typography>
                  </View>
                  {expense.notes && (
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                      {expense.notes}
                    </Typography>
                  )}
                </Card>
              );
            })
          ) : (
            !isLoading && (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: theme.colors.primarySurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <Ionicons name="receipt-outline" size={48} color={theme.colors.textMuted} />
                </View>
                <Typography variant="title1">No Expenses Found</Typography>
                <Typography variant="body" color={theme.colors.textMuted}>
                  Add your first expense to see it here.
                </Typography>
              </View>
            )
          )}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: theme.spacing.base,
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight,
        }}
      >
        <Button
          title="Add Expense"
          onPress={() => router.push('/screens/add-expense' as any)}
          leftIcon={<Ionicons name="add" size={18} color={theme.colors.white} />}
        />
      </View>
    </ScreenWrapper>
  );
}
