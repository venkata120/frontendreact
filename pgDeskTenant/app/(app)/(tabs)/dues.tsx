import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Button } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useTenant } from '../../../src/context/TenantContext';
import { useTenantDetails } from '../../../src/hooks/queries/useTenant';
import { useRentLedgersByTenant } from '../../../src/hooks/queries/useRentLedgers';
import { formatCurrency, formatDate } from '../../../src/utils/formatters';

export default function DuesScreen() {
  const theme = useTheme();
  const { tenantId } = useTenant();
  const { data: tenantDetails, isLoading: isTenantLoading } = useTenantDetails(tenantId ?? undefined);
  const { data: ledgers, isLoading: isLedgersLoading } = useRentLedgersByTenant(tenantId ?? undefined);

  const sortedLedgers = ledgers ? [...ledgers].sort((a, b) => {
    const dateA = new Date(a.dueDate || `${a.rentYear}-${a.rentMonth}-01`);
    const dateB = new Date(b.dueDate || `${b.rentYear}-${b.rentMonth}-01`);
    return dateB.getTime() - dateA.getTime();
  }) : [];

  const pendingTotal = sortedLedgers
    .filter((l) => l.status === 'DUE' || l.status === 'PARTIAL')
    .reduce((sum, l) => sum + (l.rentAmount - (l.collectedAmount || 0)), 0);

  const paidTotal = sortedLedgers
    .filter((l) => l.status === 'PAID')
    .reduce((sum, l) => sum + l.rentAmount, 0);

  const nextDue = sortedLedgers.find((l) => l.status === 'DUE' || l.status === 'PARTIAL');

  return (
    <ScreenWrapper>
      {/* Orange header */}
      <View
        style={{
          backgroundColor: theme.colors.warning,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <Typography variant="headline2" color={theme.colors.white}>
          My Dues
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
            {isTenantLoading || isLedgersLoading ? (
              <ActivityIndicator color={theme.colors.warning} />
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Typography variant="caption" color={theme.colors.textMuted}>Total Pending</Typography>
                  <Typography variant="headline1" color={theme.colors.warning}>{formatCurrency(pendingTotal)}</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {nextDue ? `Due by ${formatDate(nextDue.dueDate)}` : 'No pending dues'}
                  </Typography>
                </View>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: theme.colors.warningSurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="warning-outline" size={24} color={theme.colors.warning} />
                </View>
              </View>
            )}
          </Card>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
            <Card shadow="sm" padding={theme.spacing.md} style={{ width: '48%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="cash-outline" size={20} color={theme.colors.warning} style={{ marginRight: 8 }} />
                <View>
                  <Typography variant="caption" color={theme.colors.textMuted}>Pending</Typography>
                  <Typography variant="title2" color={theme.colors.warning}>{formatCurrency(pendingTotal)}</Typography>
                </View>
              </View>
            </Card>
            <Card shadow="sm" padding={theme.spacing.md} style={{ width: '48%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} style={{ marginRight: 8 }} />
                <View>
                  <Typography variant="caption" color={theme.colors.textMuted}>Paid</Typography>
                  <Typography variant="title2" color={theme.colors.success}>{formatCurrency(paidTotal)}</Typography>
                </View>
              </View>
            </Card>
          </View>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Dues History</Typography>
          {isLedgersLoading ? (
            <ActivityIndicator />
          ) : sortedLedgers.length === 0 ? (
            <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginVertical: theme.spacing.lg }}>
              No dues records found
            </Typography>
          ) : (
            sortedLedgers.map((due) => {
              const remaining = due.rentAmount - (due.collectedAmount || 0);
              const isPending = due.status === 'DUE' || due.status === 'PARTIAL';
              return (
                <Card key={due.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Typography variant="title3">{due.rentMonth}</Typography>
                      <Typography variant="caption" color={theme.colors.textMuted}>Due: {formatDate(due.dueDate)}</Typography>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Typography variant="title2" color={isPending ? theme.colors.warning : theme.colors.success}>
                        {formatCurrency(isPending ? remaining : due.rentAmount)}
                      </Typography>
                      <Typography variant="captionMedium" color={isPending ? theme.colors.warning : theme.colors.success}>
                        {due.status}
                      </Typography>
                    </View>
                  </View>
                </Card>
              );
            })
          )}

          <Button title="Pay Pending Dues" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xl }} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
