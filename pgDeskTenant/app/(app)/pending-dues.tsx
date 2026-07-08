import { useRouter } from 'expo-router';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { ScreenWrapper, Header, Typography, Card, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant } from '../../src/context/TenantContext';
import { useRentLedgersByTenant } from '../../src/hooks/queries/useRentLedgers';
import { formatCurrency, formatDate } from '../../src/utils/formatters';

export default function PendingDuesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { tenantId } = useTenant();
  const { data: ledgers, isLoading } = useRentLedgersByTenant(tenantId ?? undefined);

  const pendingLedgers = ledgers
    ? ledgers.filter((l) => l.status === 'DUE' || l.status === 'PARTIAL')
    : [];

  const pendingTotal = pendingLedgers.reduce(
    (sum, l) => sum + (l.rentAmount - (l.collectedAmount || 0)),
    0
  );

  const nextDue = pendingLedgers.sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  const breakdown = pendingLedgers.map((l) => ({
    label: `${l.rentMonth} Rent`,
    amount: l.rentAmount - (l.collectedAmount || 0),
  }));

  return (
    <ScreenWrapper>
      <Header title="Pending Dues" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg, backgroundColor: theme.colors.warning }}>
            {isLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Typography variant="caption" color={theme.colors.white}>Total Pending</Typography>
                <Typography variant="headline1" color={theme.colors.white}>{formatCurrency(pendingTotal)}</Typography>
                <Typography variant="body" color={theme.colors.white}>
                  {nextDue ? `Due by ${formatDate(nextDue.dueDate)}` : 'No pending dues'}
                </Typography>
              </>
            )}
          </Card>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Breakdown</Typography>
          {isLoading ? (
            <ActivityIndicator />
          ) : breakdown.length === 0 ? (
            <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginVertical: theme.spacing.lg }}>
              No pending dues
            </Typography>
          ) : (
            breakdown.map((item) => (
              <Card key={item.label} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Typography variant="bodyMedium">{item.label}</Typography>
                  <Typography variant="bodyMedium">{formatCurrency(item.amount)}</Typography>
                </View>
              </Card>
            ))
          )}

          <Button title="Pay Now" disabled={pendingTotal === 0} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
