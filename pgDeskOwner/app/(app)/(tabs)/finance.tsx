import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar, PgSelector } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';

import {
  useDashboardOverview,
  useExpensesByPg,
  useExpenseMasters,
  useRentLedgersWithTenants,
} from '../../../src/hooks/queries';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { ROUTES } from '../../../src/constants';
import type { ExpenseMaster } from '../../../src/types';

const formatMonthYear = (date: Date) =>
  date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export default function FinanceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');

  const currentMonth = useMemo(() => String(new Date().getMonth() + 1).padStart(2, '0'), []);
  const currentYear = useMemo(() => String(new Date().getFullYear()), []);
  const monthLabel = useMemo(() => formatMonthYear(new Date()), []);

  const overviewParams = useMemo(
    () => ({ month: currentMonth, year: currentYear, userId: user?.id }),
    [currentMonth, currentYear, user?.id]
  );
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useDashboardOverview(overviewParams);

  const { data: rentLedgers, isLoading: rentLedgersLoading, refetch: refetchRentLedgers } = useRentLedgersWithTenants(['PAID', 'PARTIAL']);
  const { data: expenses, isLoading: expensesLoading, refetch: refetchExpenses } = useExpensesByPg(selectedPg?.id);
  const { data: expenseMasters } = useExpenseMasters();

  useFocusEffect(
    useCallback(() => {
      refetchOverview();
      refetchRentLedgers();
      if (selectedPg?.id) {
        refetchExpenses();
      }
    }, [refetchOverview, refetchRentLedgers, refetchExpenses, selectedPg?.id])
  );

  const masterById = useMemo(() => {
    const map = new Map<string, ExpenseMaster>();
    expenseMasters?.forEach((m) => map.set(m.id, m));
    return map;
  }, [expenseMasters]);

  const pgSummary = useMemo(
    () => overview?.pgSummaries.find((p) => p.pgId === selectedPg?.id) || overview?.pgSummaries[0],
    [overview, selectedPg]
  );

  // Scope rent income to the current month/year to match the home/dashboard view.
  const getMonthValue = (rentMonth: string) => {
    if (rentMonth.includes('-')) {
      return rentMonth.split('-').pop() || rentMonth;
    }
    return rentMonth;
  };

  const rentIncome = useMemo(
    () =>
      (rentLedgers || [])
        .filter(
          (l) =>
            String(getMonthValue(l.rentMonth)).padStart(2, '0') === currentMonth &&
            l.rentYear === Number(currentYear)
        )
        .reduce((sum, l) => sum + (l.collectedAmount || 0), 0),
    [rentLedgers, currentMonth, currentYear]
  );

  // Food/mess and utility income are not yet tracked separately on the backend.
  const foodIncome = 0;
  const utilityIncome = 0;

  // Income shown is scoped to the selected PG. Rent income is computed from the
  // selected PG's tenants; food/mess and utility income are not tracked yet.
  const totalIncome = useMemo(
    () => rentIncome + foodIncome + utilityIncome,
    [rentIncome]
  );

  const pendingPayments = useMemo(
    () => pgSummary?.pendingDues ?? 0,
    [pgSummary]
  );

  // Total expected revenue used for percentage breakdown (collected + pending).
  const totalExpected = useMemo(
    () => totalIncome + pendingPayments,
    [totalIncome, pendingPayments]
  );

  const incomeItems = useMemo(() => {
    const categories = [
      { key: 'rent', label: 'Rent Payments', icon: 'home' as const, color: '#00A63E', amount: rentIncome, route: ROUTES.SCREENS.COLLECTED_AMOUNT },
      { key: 'food', label: 'Food / Mess Charges', icon: 'restaurant' as const, color: '#E27305', amount: foodIncome, route: ROUTES.SCREENS.FOOD_MESS_CHARGES },
      { key: 'utility', label: 'Utility Charges', icon: 'flash' as const, color: '#0065F4', amount: utilityIncome, route: ROUTES.SCREENS.UTILITY_CHARGES },
      { key: 'pending', label: 'Pending Payments', icon: 'time' as const, color: '#E27305', amount: pendingPayments, route: ROUTES.SCREENS.PENDING_DUES },
    ];
    return categories.map((c) => ({
      ...c,
      percent: totalExpected > 0 ? Math.round((c.amount / totalExpected) * 100) : 0,
    }));
  }, [rentIncome, pendingPayments, totalExpected]);

  const expenseGroups = useMemo(() => {
    const map = new Map<string, { category: string; items: { name: string; amount: number }[] }>();
    (expenses || []).forEach((e) => {
      const master = masterById.get(e.expenseMasterId || '');
      const category = master?.categoryName || e.customSubcategoryName || 'Other';
      const name = master?.subcategoryName || e.customSubcategoryName || category;
      const existing = map.get(category) || { category, items: [] };
      existing.items.push({ name, amount: e.amount || 0 });
      map.set(category, existing);
    });
    return Array.from(map.values()).map((g) => ({
      ...g,
      total: g.items.reduce((sum, i) => sum + i.amount, 0),
    })).sort((a, b) => b.total - a.total);
  }, [expenses, masterById]);

  const isLoading = overviewLoading || rentLedgersLoading || expensesLoading;

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header image with overlay controls */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.22)' }} />
          <View
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={openDrawer}>
                <Avatar size={44} uri="" name={user?.name} />
              </TouchableOpacity>
              <View style={{ marginLeft: theme.spacing.sm }}>
                <PgSelector />
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(ROUTES.SCREENS.NOTIFICATIONS as any)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FACC15',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications" size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ padding: theme.spacing.base }}>
          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="bar-chart" size={22} color={theme.colors.text} style={{ marginRight: 8 }} />
              <Typography variant="headline2">Finance</Typography>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.white,
                borderRadius: theme.radius.md,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
              }}
            >
              <Ionicons name="calendar-outline" size={16} color={theme.colors.text} style={{ marginRight: 6 }} />
              <Typography variant="bodyMedium" style={{ fontWeight: '500' }}>
                {monthLabel}
              </Typography>
              <Ionicons name="chevron-down" size={14} color={theme.colors.textMuted} style={{ marginLeft: 6 }} />
            </View>
          </View>

          {/* Income / Expenses toggle */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: theme.radius.full,
              padding: 4,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('income')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: theme.radius.full,
                backgroundColor: activeTab === 'income' ? theme.colors.success : 'transparent',
              }}
            >
              <Ionicons name="cash" size={16} color={activeTab === 'income' ? theme.colors.white : theme.colors.success} />
              <Typography
                variant="bodyMedium"
                color={activeTab === 'income' ? theme.colors.white : theme.colors.success}
                style={{ marginLeft: 6, fontWeight: '600' }}
              >
                Income
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('expenses')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: theme.radius.full,
                backgroundColor: activeTab === 'expenses' ? theme.colors.danger : 'transparent',
              }}
            >
              <Ionicons name="trending-down" size={16} color={activeTab === 'expenses' ? theme.colors.white : theme.colors.danger} />
              <Typography
                variant="bodyMedium"
                color={activeTab === 'expenses' ? theme.colors.white : theme.colors.danger}
                style={{ marginLeft: 6, fontWeight: '600' }}
              >
                Expenses
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={{ padding: theme.spacing.base }}>
            <Typography variant="body" color={theme.colors.textMuted}>Loading finance...</Typography>
          </View>
        ) : (
          <View style={{ paddingHorizontal: theme.spacing.base, paddingBottom: theme.spacing.xl }}>
            {activeTab === 'income' ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                  <Typography variant="title1">Income by category</Typography>
                  <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '500' }}>
                      view All
                    </Typography>
                    <Ionicons name="chevron-down" size={14} color={theme.colors.primary} style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                {incomeItems.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.8}
                    onPress={() => router.push(item.route as any)}
                  >
                    <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: `${item.color}15`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: theme.spacing.md,
                          }}
                        >
                          <Ionicons name={item.icon} size={22} color={item.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                            {item.label}
                          </Typography>
                          <Typography variant="caption" color={theme.colors.textMuted}>
                            {item.percent}% of total
                          </Typography>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Typography variant="bodyMedium" color={item.color} style={{ fontWeight: '700' }}>
                            ₹{item.amount.toLocaleString()}
                          </Typography>
                          <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} style={{ marginLeft: 6 }} />
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push(ROUTES.SCREENS.COLLECTED_AMOUNT as any)}
                  style={{
                    backgroundColor: theme.colors.success,
                    borderRadius: theme.radius.full,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: theme.spacing.sm,
                  }}
                >
                  <Ionicons name="add" size={20} color={theme.colors.white} />
                  <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
                    Add Income
                  </Typography>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                  <Typography variant="title1">Expences by category</Typography>
                  <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '500' }}>
                      view All
                    </Typography>
                    <Ionicons name="chevron-down" size={14} color={theme.colors.primary} style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                {expenseGroups.length > 0 ? (
                  expenseGroups.map((group) => (
                    <Card key={group.category} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                      <Typography variant="bodyMedium" color={theme.colors.danger} style={{ fontWeight: '500', marginBottom: theme.spacing.sm }}>
                        {group.category} (Monthly)
                      </Typography>
                      {group.items.map((item, index) => (
                        <View
                          key={`${item.name}-${index}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: theme.spacing.sm,
                            borderBottomWidth: index < group.items.length - 1 ? 1 : 0,
                            borderBottomColor: theme.colors.borderLight,
                          }}
                        >
                          <View>
                            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color={theme.colors.textMuted}>
                              1 Transaction
                            </Typography>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Typography variant="bodyMedium" color={theme.colors.danger} style={{ fontWeight: '700' }}>
                              ₹{item.amount.toLocaleString()}
                            </Typography>
                            <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} style={{ marginLeft: 6 }} />
                          </View>
                        </View>
                      ))}
                    </Card>
                  ))
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
                    <Ionicons name="receipt-outline" size={48} color={theme.colors.border} />
                    <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                      No expenses found
                    </Typography>
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push('/screens/add-expense' as any)}
                  style={{
                    backgroundColor: theme.colors.danger,
                    borderRadius: theme.radius.full,
                    paddingVertical: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: theme.spacing.sm,
                  }}
                >
                  <Ionicons name="add" size={20} color={theme.colors.white} />
                  <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
                    Add Expenses
                  </Typography>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>

    </ScreenWrapper>
  );
}
