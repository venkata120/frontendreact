import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Typography,
  Card,
  SearchBar,
  Avatar,
  Button,
  ScreenHeader,
  PaymentStats,
  FilterSheet,
  InfoRow,
} from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useRentLedgersWithTenants } from '../../src/hooks/queries';
import { useMemo, useCallback, useState } from 'react';
import type { RentLedger, RentStatus } from '../../src/types';

const formatDate = (date?: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB');
};

const getMonthValue = (rentMonth: string) => {
  if (rentMonth.includes('-')) {
    return rentMonth.split('-').pop() || rentMonth;
  }
  return rentMonth;
};

const CURRENT_MONTH = String(new Date().getMonth() + 1).padStart(2, '0');
const CURRENT_YEAR = new Date().getFullYear();

export default function CollectedAmountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: ledgers, isLoading, refetch } = useRentLedgersWithTenants(['PAID', 'PARTIAL']);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RentStatus>('ALL');
  const [filterOpen, setFilterOpen] = useState(false);
  const [receiptModal, setReceiptModal] = useState<RentLedger | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const monthlyLedgers = useMemo(
    () =>
      (ledgers || []).filter(
        (l) => String(getMonthValue(l.rentMonth)).padStart(2, '0') === CURRENT_MONTH && l.rentYear === CURRENT_YEAR
      ),
    [ledgers]
  );

  const filtered = useMemo(() => {
    let result = monthlyLedgers;
    if (statusFilter !== 'ALL') {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter((l) => {
      const name = l.tenant?.fullName.toLowerCase() || '';
      const room = (l.tenant?.roomNumber || l.tenant?.bedNumber || '').toLowerCase();
      return name.includes(q) || room.includes(q);
    });
  }, [monthlyLedgers, search, statusFilter]);

  const totalIncome = useMemo(
    () => monthlyLedgers.reduce((sum, d) => sum + (d.collectedAmount || 0), 0),
    [monthlyLedgers]
  );
  const totalTransactions = useMemo(() => monthlyLedgers.length, [monthlyLedgers]);

  const handleShareReceipt = async (ledger: RentLedger) => {
    const message = `Payment Receipt\nTenant: ${ledger.tenant?.fullName}\nAmount: ₹${(
      ledger.collectedAmount || 0
    ).toLocaleString()}\nMonth: ${ledger.rentMonth}/${ledger.rentYear}\nStatus: ${ledger.status}`;
    const url = `mailto:?subject=Payment Receipt&body=${encodeURIComponent(message)}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Collected Payments"
        backgroundColor={theme.colors.success}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/screens/add-payment' as any)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="calendar" size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar
                placeholder="Search by name, room or phone..."
                value={search}
                onChangeText={setSearch}
                style={{ marginHorizontal: 0, marginVertical: 0 }}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFilterOpen(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: statusFilter !== 'ALL' ? theme.colors.successSurface : theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: statusFilter !== 'ALL' ? theme.colors.success : theme.colors.border,
              }}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color={statusFilter !== 'ALL' ? theme.colors.success : theme.colors.text}
              />
            </TouchableOpacity>
          </View>

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
                  Collection Overview
                </Typography>
                <Typography variant="headline1" color={theme.colors.white}>
                  ₹{totalIncome.toLocaleString()}
                </Typography>
                <Typography variant="caption" color={theme.colors.white} style={{ opacity: 0.9 }}>
                  from {totalTransactions} Payments
                </Typography>
              </View>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="cash" size={36} color={theme.colors.white} />
              </View>
            </View>
          </Card>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <Typography variant="title1">Monthly Collections</Typography>
            <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '500' }}>
                See All
              </Typography>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {!isLoading && filtered.length === 0 && (
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
          )}

          {!isLoading &&
            filtered.map((ledger) => {
              const tenant = ledger.tenant;
              const paid = ledger.collectedAmount || 0;
              const total = ledger.rentAmount;
              const pending = total - paid;
              return (
                <Card key={ledger.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Avatar uri={tenant?.avatar} name={tenant?.fullName} size={44} />
                      <View style={{ marginLeft: theme.spacing.md }}>
                        <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                          {tenant?.fullName || 'Tenant'}
                        </Typography>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Ionicons name="bed-outline" size={12} color={theme.colors.primary} />
                          <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4 }}>
                            Room {tenant?.roomNumber || tenant?.bedNumber || '-'}
                          </Typography>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setReceiptModal(ledger)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.colors.primary,
                        borderRadius: theme.radius.md,
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: 4,
                      }}
                    >
                      <Ionicons name="receipt-outline" size={14} color={theme.colors.white} />
                      <Typography variant="caption" color={theme.colors.white} style={{ marginLeft: 4, fontWeight: '600' }}>
                        View Receipt
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <Ionicons name="calendar-outline" size={12} color={theme.colors.textMuted} />
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>
                      {formatDate(ledger.dueDate)}
                    </Typography>
                    <View
                      style={{
                        backgroundColor: ledger.status === 'PAID' ? theme.colors.successSurface : theme.colors.warningSurface,
                        borderRadius: theme.radius.full,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginLeft: theme.spacing.md,
                      }}
                    >
                      <Typography variant="captionMedium" color={ledger.status === 'PAID' ? theme.colors.success : theme.colors.warning}>
                        {ledger.status === 'PAID' ? 'Cash' : 'Partial'}
                      </Typography>
                    </View>
                  </View>

                  <PaymentStats total={total} partial={paid} pending={pending} />
                </Card>
              );
            })}

          <View style={{ height: theme.spacing.xl }} />
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
          title="Record Payment"
          leftIcon={<Ionicons name="add" size={20} color={theme.colors.white} />}
          onPress={() => router.push('/screens/add-payment' as any)}
        />
      </View>

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Sort & Filter"
        selected={statusFilter}
        onSelect={(v) => setStatusFilter(v)}
        options={[
          { label: 'All', value: 'ALL', icon: 'apps-outline' },
          { label: 'Paid', value: 'PAID', icon: 'checkmark-circle-outline' },
          { label: 'Partial', value: 'PARTIAL', icon: 'cash-outline' },
        ]}
      />

      <Modal visible={!!receiptModal} transparent animationType="slide" onRequestClose={() => setReceiptModal(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <Typography variant="title1" style={{ fontWeight: '600' }}>
                Payment Receipt
              </Typography>
              <TouchableOpacity onPress={() => setReceiptModal(null)}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                {receiptModal?.tenant?.fullName}
              </Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Room {receiptModal?.tenant?.roomNumber || receiptModal?.tenant?.bedNumber || '-'}
              </Typography>
              <View style={{ marginTop: theme.spacing.sm }}>
                <InfoRow label="Amount" value={`₹${(receiptModal?.collectedAmount || 0).toLocaleString()}`} icon="cash-outline" isLast />
                <InfoRow label="Month" value={`${receiptModal?.rentMonth}/${receiptModal?.rentYear}`} icon="calendar-outline" isLast />
                <InfoRow label="Status" value={receiptModal?.status || '-'} icon="checkmark-circle-outline" isLast />
              </View>
            </Card>
            <Button
              title="Share Receipt"
              leftIcon={<Ionicons name="share-outline" size={20} color={theme.colors.white} />}
              onPress={() => receiptModal && handleShareReceipt(receiptModal)}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
