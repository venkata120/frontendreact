import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useRentLedgersWithTenants } from '../../src/hooks/queries';
import { useMemo } from 'react';
import type { RentLedger, Tenant } from '../../src/types';

type LedgerWithTenant = RentLedger & { tenant?: Tenant };

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

function PaymentCard({ payment, theme }: { payment: LedgerWithTenant; theme: any }) {
  return (
    <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.borderLight,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar uri="" name={payment.tenant?.fullName} size={48} />
          <View style={{ marginLeft: theme.spacing.md }}>
            <Typography variant="title2">{payment.tenant?.fullName || 'Tenant'}</Typography>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="bed-outline" size={12} color={theme.colors.secondary} />
              <Typography variant="caption" color={theme.colors.secondary} style={{ marginLeft: 4 }}>
                Room {payment.tenant?.roomNumber || payment.tenant?.bedNumber || '-'}
              </Typography>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Typography variant="bodyMedium" color={theme.colors.secondary}>Rent</Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="calendar-outline" size={12} color={theme.colors.textMuted} />
            <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>
              {formatDate(payment.dueDate)}
            </Typography>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
        <View>
          <Typography variant="caption" color={theme.colors.textMuted}>Paid Amount</Typography>
          <Typography variant="title2" color={theme.colors.success}>
            ₹{(payment.collectedAmount || 0).toLocaleString()}
          </Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} />
            <Typography variant="caption" color={theme.colors.success} style={{ marginLeft: 4 }}>
              Paid
            </Typography>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Typography variant="caption" color={theme.colors.textMuted}>Payment mode</Typography>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="flash" size={14} color={theme.colors.warning} />
            <Typography variant="bodyMedium" style={{ marginLeft: 4 }}>Cash</Typography>
          </View>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: theme.spacing.sm }}>
        <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '600' }}>
          View Receipt
        </Typography>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </Card>
  );
}

export default function PaymentsSalaryHistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: ledgers, isLoading } = useRentLedgersWithTenants(['PAID', 'PARTIAL']);

  const sorted = useMemo(() => {
    if (!ledgers) return [];
    return [...ledgers].sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [ledgers]);

  const recent = sorted[0];
  const last = sorted.slice(1);

  return (
    <ScreenWrapper>
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
        <Typography variant="headline2" color={theme.colors.white}>All Payments</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {!isLoading && recent && (
            <>
              <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Recent Payment</Typography>
              <PaymentCard payment={recent} theme={theme} />
            </>
          )}

          {!isLoading && last.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <Typography variant="title1">Last Payments</Typography>
                <Typography variant="title2" color={theme.colors.primary}>{last.length}</Typography>
              </View>
              {last.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} theme={theme} />
              ))}
            </>
          )}

          {!isLoading && sorted.length === 0 && (
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
              <Typography variant="title1">No Payments Found</Typography>
              <Typography variant="body" color={theme.colors.textMuted}>
                Collected payments will appear here.
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
