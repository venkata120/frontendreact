import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useRentLedgersWithTenants } from '../../src/hooks/queries';
import { useMemo, useCallback } from 'react';

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, '0');
const CURRENT_YEAR = new Date().getFullYear();

export default function CollectedAmountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: ledgers, isLoading, refetch } = useRentLedgersWithTenants(['PAID', 'PARTIAL']);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Scope rent payments to the current month/year so the total matches the
  // "Collected Amount" card on the home page (dashboard overview).
  const getMonthValue = (rentMonth: string) => {
    if (rentMonth.includes('-')) {
      return rentMonth.split('-').pop() || rentMonth;
    }
    return rentMonth;
  };

  const monthlyLedgers = useMemo(
    () =>
      (ledgers || []).filter(
        (l) => String(getMonthValue(l.rentMonth)).padStart(2, '0') === CURRENT_MONTH && l.rentYear === CURRENT_YEAR
      ),
    [ledgers]
  );

  const totalIncome = useMemo(
    () => monthlyLedgers.reduce((sum, d) => sum + (d.collectedAmount || 0), 0),
    [monthlyLedgers]
  );
  const totalTransactions = useMemo(() => monthlyLedgers.length, [monthlyLedgers]);
  const avgPerTransaction = useMemo(
    () => (totalTransactions > 0 ? Math.round(totalIncome / totalTransactions) : 0),
    [totalIncome, totalTransactions]
  );

  // Assume total income is 100% for rent payments in this view.
  const percentOfTotalIncome = 100;

  return (
    <ScreenWrapper>
      {/* Green header */}
      <View
        style={{
          backgroundColor: theme.colors.success,
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
          <Ionicons name="arrow-back" size={20} color={theme.colors.success} />
        </TouchableOpacity>
        <Typography variant="headline2" color={theme.colors.white}>
          Rent Payments
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          {/* Home icon circle */}
          <View style={{ alignItems: 'center', marginVertical: theme.spacing.lg }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.success,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: theme.colors.white,
                shadowColor: theme.colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="home" size={36} color={theme.colors.white} />
            </View>
          </View>

          {/* Total income card */}
          <Card shadow="md" padding={theme.spacing.lg} style={{ backgroundColor: theme.colors.white, marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  Total income
                </Typography>
                <Typography variant="headline1" color={theme.colors.success}>
                  ₹ {totalIncome.toLocaleString()}
                </Typography>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Typography variant="title1" color={theme.colors.success} style={{ fontWeight: '700' }}>
                  {percentOfTotalIncome}%
                </Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  of total income
                </Typography>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: theme.spacing.md,
                paddingTop: theme.spacing.md,
                borderTopWidth: 1,
                borderTopColor: theme.colors.borderLight,
              }}
            >
              <View>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  Total Transactions
                </Typography>
                <Typography variant="title2" style={{ fontWeight: '700' }}>
                  {totalTransactions}
                </Typography>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  Avg per Transaction
                </Typography>
                <Typography variant="title2" style={{ fontWeight: '700' }}>
                  ₹ {avgPerTransaction.toLocaleString()}
                </Typography>
              </View>
            </View>
          </Card>

          {/* Recent Transactions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <Typography variant="title1">Recent Transactions</Typography>
            <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '500' }}>
                view All
              </Typography>
              <Ionicons name="chevron-down" size={14} color={theme.colors.primary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {!isLoading && monthlyLedgers.length > 0 ? (
            monthlyLedgers.map((ledger) => (
              <Card key={ledger.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar uri="" name={ledger.tenant?.fullName} size={44} />
                    <View style={{ marginLeft: theme.spacing.md }}>
                      <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                        {ledger.tenant?.fullName || 'Tenant'} (Room {ledger.tenant?.roomNumber || ledger.tenant?.bedNumber || '-'})
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textMuted}>
                        {formatDate(ledger.dueDate)}
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="bodyMedium" color={theme.colors.success} style={{ fontWeight: '700' }}>
                    ₹ {(ledger.collectedAmount || 0).toLocaleString()}
                  </Typography>
                </View>
              </Card>
            ))
          ) : (
            !isLoading && (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: theme.colors.successSurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: theme.spacing.lg,
                  }}
                >
                  <Ionicons name="cash-outline" size={48} color={theme.colors.textMuted} />
                </View>
                <Typography variant="title1">No Rent Payments</Typography>
                <Typography variant="body" color={theme.colors.textMuted}>
                  Rent payments collected will appear here.
                </Typography>
              </View>
            )
          )}

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Add Income button */}
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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/screens/add-payment' as any)}
          style={{
            backgroundColor: theme.colors.success,
            borderRadius: theme.radius.full,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
          <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
            Add Income
          </Typography>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
