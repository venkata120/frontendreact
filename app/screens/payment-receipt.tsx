import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, ScreenHeader, Button, InfoRow, Badge } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant } from '../../src/hooks/queries';
import type { RentLedger } from '../../src/types';

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

const statusMeta: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  PAID: { label: 'Paid', variant: 'success' },
  PARTIAL: { label: 'Partial', variant: 'warning' },
  DUE: { label: 'Due', variant: 'danger' },
};

export default function PaymentReceiptScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { tenantId, ledgerId } = useLocalSearchParams<{ tenantId: string; ledgerId: string }>();
  const { data: tenant, isLoading } = useTenant(tenantId);

  const ledger: RentLedger | undefined = tenant?.rentLedgers?.find((l) => l.id === ledgerId);

  const handleShare = () => {
    if (!ledger || !tenant) return;
    const paid = ledger.collectedAmount || 0;
    const message = `Payment Receipt\nTenant: ${tenant.fullName}\nAmount: ₹${paid.toLocaleString()}\nMonth: ${ledger.rentMonth}/${ledger.rentYear}\nStatus: ${ledger.status}`;
    const url = `mailto:?subject=Payment Receipt&body=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
    });
  };

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Payment Receipt"
        backgroundColor={theme.colors.success}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          {isLoading && (
            <Typography variant="body" color={theme.colors.textMuted}>
              Loading receipt...
            </Typography>
          )}

          {!isLoading && !ledger && (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: theme.colors.dangerSurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Ionicons name="receipt-outline" size={48} color={theme.colors.danger} />
              </View>
              <Typography variant="title1">Receipt Not Found</Typography>
              <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginTop: theme.spacing.sm }}>
                The payment record could not be loaded.
              </Typography>
            </View>
          )}

          {!isLoading && ledger && tenant && (
            <>
              <Card
                shadow="md"
                padding={theme.spacing.lg}
                style={{
                  backgroundColor: theme.colors.success,
                  marginBottom: theme.spacing.lg,
                  overflow: 'hidden',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Typography variant="caption" color={theme.colors.white} style={{ opacity: 0.9 }}>
                      Receipt Amount
                    </Typography>
                    <Typography variant="headline1" color={theme.colors.white}>
                      ₹{(ledger.collectedAmount || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color={theme.colors.white} style={{ opacity: 0.9 }}>
                      {ledger.rentMonth}/{ledger.rentYear}
                    </Typography>
                  </View>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={36} color={theme.colors.white} />
                  </View>
                </View>
              </Card>

              <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Typography variant="title2">Tenant</Typography>
                </View>
                <InfoRow label="Name" value={tenant.fullName} icon="person-outline" />
                <InfoRow label="Phone" value={tenant.phone} icon="call-outline" />
                <InfoRow label="Room" value={tenant.roomNumber || tenant.bedNumber || '-'} icon="bed-outline" isLast />
              </Card>

              <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="cash-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Typography variant="title2">Payment Details</Typography>
                  </View>
                  <Badge label={statusMeta[ledger.status]?.label || ledger.status} variant={statusMeta[ledger.status]?.variant || 'secondary'} />
                </View>
                <InfoRow label="Rent Amount" value={`₹${ledger.rentAmount.toLocaleString()}`} icon="cash-outline" />
                <InfoRow label="Paid Amount" value={`₹${(ledger.collectedAmount || 0).toLocaleString()}`} icon="checkmark-circle-outline" valueColor={theme.colors.success} />
                <InfoRow label="Pending Amount" value={`₹${(ledger.rentAmount - (ledger.collectedAmount || 0)).toLocaleString()}`} icon="time-outline" valueColor={theme.colors.warning} />
                <InfoRow label="Due Date" value={formatDate(ledger.dueDate)} icon="calendar-outline" />
                <InfoRow label="Receipt Number" value="#PENDING-BACKEND" icon="receipt-outline" isLast />
              </Card>

              <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg, backgroundColor: theme.colors.warningSurface }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.warning} style={{ marginRight: 8, marginTop: 2 }} />
                  <Typography variant="body" color={theme.colors.textTertiary}>
                    Backend note: receipt details such as receipt number, payment mode, and exact payment date are not yet exposed. This screen uses the rent ledger as the source of truth.
                  </Typography>
                </View>
              </Card>

              <Button
                title="Share Receipt"
                leftIcon={<Ionicons name="share-outline" size={20} color={theme.colors.white} />}
                onPress={handleShare}
              />
            </>
          )}

          <View style={{ height: theme.spacing.xl }} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
