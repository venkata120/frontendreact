import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar, ScreenHeader, Badge } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant } from '../../src/hooks/queries';

const statusMeta: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  PAID: { label: 'Paid', variant: 'success' },
  PARTIAL: { label: 'Partial', variant: 'warning' },
  DUE: { label: 'Due', variant: 'danger' },
};

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

export default function AllPaymentsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { tenantId } = useLocalSearchParams<{ tenantId: string }>();
  const { data: tenant, isLoading } = useTenant(tenantId);

  const ledgers = tenant?.rentLedgers || [];

  const handleViewReceipt = (ledgerId: string) => {
    router.push({
      pathname: '/screens/payment-receipt',
      params: { tenantId, ledgerId },
    } as any);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="All Payments"
        subtitle={tenant ? tenant.fullName : undefined}
        backgroundColor={theme.colors.primary}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          {tenant && (
            <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar uri={tenant.avatar} name={tenant.fullName} size={56} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                  <Typography variant="title2">{tenant.fullName}</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    Room {tenant.roomNumber || tenant.bedNumber || '-'} · ₹{tenant.rentPerMonth.toLocaleString()}/mo
                  </Typography>
                </View>
              </View>
            </Card>
          )}

          {isLoading && (
            <Typography variant="body" color={theme.colors.textMuted}>
              Loading payments...
            </Typography>
          )}

          {!isLoading && ledgers.length === 0 && (
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
                <Ionicons name="cash-outline" size={48} color={theme.colors.primary} />
              </View>
              <Typography variant="title1">No Payment History</Typography>
              <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginTop: theme.spacing.sm }}>
                Rent payments and dues for this tenant will appear here.
              </Typography>
            </View>
          )}

          {!isLoading &&
            ledgers.map((ledger) => {
              const meta = statusMeta[ledger.status] || { label: ledger.status, variant: 'secondary' as const };
              const paid = ledger.collectedAmount || 0;
              const pending = ledger.rentAmount - paid;
              return (
                <TouchableOpacity
                  key={ledger.id}
                  activeOpacity={0.8}
                  onPress={() => handleViewReceipt(ledger.id)}
                >
                  <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
                        <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                          {ledger.rentMonth}/{ledger.rentYear}
                        </Typography>
                      </View>
                      <Badge label={meta.label} variant={meta.variant} />
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm }}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          Rent Amount
                        </Typography>
                        <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                          ₹{ledger.rentAmount.toLocaleString()}
                        </Typography>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          Paid
                        </Typography>
                        <Typography variant="bodyMedium" color={theme.colors.success} style={{ fontWeight: '600' }}>
                          ₹{paid.toLocaleString()}
                        </Typography>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          Pending
                        </Typography>
                        <Typography variant="bodyMedium" color={pending > 0 ? theme.colors.warning : theme.colors.text} style={{ fontWeight: '600' }}>
                          ₹{pending.toLocaleString()}
                        </Typography>
                      </View>
                    </View>

                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                      Due: {formatDate(ledger.dueDate)}
                    </Typography>
                  </Card>
                </TouchableOpacity>
              );
            })}

          <View style={{ height: theme.spacing.xl }} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
