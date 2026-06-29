import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, Avatar, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import {
  useRentLedgersWithTenants,
  useRentLedgersByPgMonthYear,
  useActiveTenantsByPg,
  useRecordPayment,
  useRecordCollectedPayment,
  useGenerateMonthlyDues,
} from '../../src/hooks/queries';
import { useState, useMemo, useCallback } from 'react';
import type { RentLedger, Tenant } from '../../src/types';

type LedgerWithTenant = RentLedger & { tenant?: Tenant };
type PendingItem =
  | { type: 'ledger'; ledger: LedgerWithTenant }
  | { type: 'tenant'; tenant: Tenant; month: string; year: number };

const now = new Date();
const CURRENT_MONTH = String(now.getMonth() + 1).padStart(2, '0');
const CURRENT_YEAR = now.getFullYear();

export default function PendingDuesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPg } = useSelectedPg();

  const { data: ledgers, isLoading: ledgersLoading, refetch: refetchLedgers } = useRentLedgersWithTenants(['DUE', 'PARTIAL']);
  const { data: allMonthLedgers, isLoading: monthLedgersLoading } = useRentLedgersByPgMonthYear(
    selectedPg?.id,
    CURRENT_MONTH,
    CURRENT_YEAR
  );
  const { data: tenants, isLoading: tenantsLoading } = useActiveTenantsByPg(selectedPg?.id);
  const recordPayment = useRecordPayment();
  const recordCollectedPayment = useRecordCollectedPayment();
  const generateDues = useGenerateMonthlyDues();

  const [search, setSearch] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [amountError, setAmountError] = useState('');

  const items = useMemo<PendingItem[]>(() => {
    if (!tenants) return [];

    const ledgerItems: PendingItem[] = (ledgers || []).map((ledger) => ({ type: 'ledger', ledger }));
    const ledgerTenantIds = new Set((ledgers || []).map((l) => l.tenantId));

    const tenantItems: PendingItem[] = tenants
      .filter((tenant) => {
        // Skip tenants that already appear in DUE/PARTIAL ledgers
        if (ledgerTenantIds.has(tenant.id)) return false;
        // Skip tenants that have a PAID ledger for current month
        const paidForMonth = (allMonthLedgers || []).some(
          (l) => l.tenantId === tenant.id && l.status === 'PAID'
        );
        return !paidForMonth;
      })
      .map((tenant) => ({ type: 'tenant', tenant, month: CURRENT_MONTH, year: CURRENT_YEAR }));

    return [...ledgerItems, ...tenantItems];
  }, [ledgers, tenants, allMonthLedgers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      const tenant = item.type === 'ledger' ? item.ledger.tenant : item.tenant;
      const name = tenant?.fullName.toLowerCase() || '';
      const room = (tenant?.roomNumber || tenant?.bedNumber || '').toLowerCase();
      return name.includes(q) || room.includes(q);
    });
  }, [items, search]);

  const totalPending = useMemo(() => {
    return filtered.reduce((sum, item) => {
      if (item.type === 'ledger') {
        return sum + (item.ledger.rentAmount - (item.ledger.collectedAmount || 0));
      }
      return sum + (item.tenant.rentPerMonth || 0);
    }, 0);
  }, [filtered]);

  const totalPartialPaid = useMemo(() => {
    return (ledgers || []).reduce((sum, d) => sum + (d.collectedAmount || 0), 0);
  }, [ledgers]);

  const getPendingAmount = useCallback((item: PendingItem) => {
    if (item.type === 'ledger') {
      return item.ledger.rentAmount - (item.ledger.collectedAmount || 0);
    }
    return item.tenant.rentPerMonth || 0;
  }, []);

  const getTenant = useCallback((item: PendingItem) => {
    return item.type === 'ledger' ? item.ledger.tenant : item.tenant;
  }, []);

  const openPaymentModal = (item: PendingItem) => {
    setSelectedItem(item);
    setPaymentAmount(String(getPendingAmount(item)));
    setAmountError('');
    setPaymentModalVisible(true);
  };

  const closePaymentModal = () => {
    setPaymentModalVisible(false);
    setSelectedItem(null);
    setPaymentAmount('');
    setAmountError('');
  };

  const handlePay = async () => {
    if (!selectedItem) return;
    const amount = parseFloat(paymentAmount);
    const pending = getPendingAmount(selectedItem);
    if (Number.isNaN(amount) || amount <= 0) {
      setAmountError('Enter a valid amount');
      return;
    }
    if (amount > pending) {
      setAmountError(`Amount cannot exceed pending ₹${pending}`);
      return;
    }

    if (selectedItem.type === 'ledger') {
      await recordPayment.mutateAsync({ ledger: selectedItem.ledger, amount });
    } else {
      await recordCollectedPayment.mutateAsync({
        tenant: selectedItem.tenant,
        month: selectedItem.month,
        year: selectedItem.year,
        amount,
        mode: 'Cash',
      });
    }
    closePaymentModal();
  };

  const isLoading = ledgersLoading || tenantsLoading || monthLedgersLoading;

  useFocusEffect(
    useCallback(() => {
      refetchLedgers();
    }, [refetchLedgers])
  );

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.warning,
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
          <Ionicons name="arrow-back" size={20} color={theme.colors.warning} />
        </TouchableOpacity>
        <Typography variant="headline2" color={theme.colors.white}>
          Pending Payments
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search by name or Room" value={search} onChangeText={setSearch} />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => generateDues.mutate({ month: CURRENT_MONTH, year: CURRENT_YEAR })}
              disabled={generateDues.isPending}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              {generateDues.isPending ? (
                <Ionicons name="refresh" size={22} color={theme.colors.primary} />
              ) : (
                <Ionicons name="add-circle" size={22} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: theme.spacing.md }}>
            <Card shadow="sm" padding={theme.spacing.md} style={{ width: '48%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.colors.warningSurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <Ionicons name="cash-outline" size={22} color={theme.colors.warning} />
                </View>
                <View>
                  <Typography variant="caption" color={theme.colors.textMuted}>Pending Dues</Typography>
                  <Typography variant="title2" color={theme.colors.warning}>₹{totalPending.toLocaleString()}</Typography>
                </View>
              </View>
            </Card>
            <Card shadow="sm" padding={theme.spacing.md} style={{ width: '48%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.colors.successSurface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <Ionicons name="cash-outline" size={22} color={theme.colors.success} />
                </View>
                <View>
                  <Typography variant="caption" color={theme.colors.textMuted}>Partial Paid</Typography>
                  <Typography variant="title2" color={theme.colors.success}>₹{totalPartialPaid.toLocaleString()}</Typography>
                </View>
              </View>
            </Card>
          </View>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {!isLoading && filtered.length === 0 && (
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
                <Ionicons name="cash-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <Typography variant="title1">No Pending Payments</Typography>
              <Typography variant="body" color={theme.colors.textMuted}>
                All active tenants are up to date.
              </Typography>
            </View>
          )}

          {!isLoading &&
            filtered.map((item) => {
              const tenant = getTenant(item);
              const pending = getPendingAmount(item);
              const isLedger = item.type === 'ledger';
              const rentAmount = isLedger ? item.ledger.rentAmount : item.tenant.rentPerMonth || 0;
              const collectedAmount = isLedger ? item.ledger.collectedAmount || 0 : 0;

              return (
                <Card key={isLedger ? item.ledger.id : item.tenant.id} shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Avatar uri="" name={tenant?.fullName} size={48} />
                      <View style={{ marginLeft: theme.spacing.md }}>
                        <Typography variant="title2">{tenant?.fullName || 'Tenant'}</Typography>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Ionicons name="bed-outline" size={12} color={theme.colors.primary} />
                          <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4 }}>
                            Room {tenant?.roomNumber || tenant?.bedNumber || '-'}
                          </Typography>
                        </View>
                      </View>
                    </View>
                    <Typography variant="title2" color={theme.colors.warning}>₹{pending.toLocaleString()}</Typography>
                  </View>

                  <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: theme.colors.borderLight, borderRadius: theme.radius.md, marginBottom: theme.spacing.md }}>
                    {[
                      { label: 'Total amount', value: `₹${rentAmount.toLocaleString()}`, color: theme.colors.text },
                      { label: 'Partial', value: `₹${collectedAmount.toLocaleString()}`, color: theme.colors.success },
                      { label: 'Pending', value: `₹${pending.toLocaleString()}`, color: theme.colors.warning },
                    ].map((stat, index) => (
                      <View
                        key={stat.label}
                        style={{
                          flex: 1,
                          paddingVertical: theme.spacing.sm,
                          alignItems: 'center',
                          borderRightWidth: index < 2 ? 1 : 0,
                          borderRightColor: theme.colors.borderLight,
                        }}
                      >
                        <Typography variant="caption" color={theme.colors.textMuted}>{stat.label}</Typography>
                        <Typography variant="bodyMedium" color={stat.color} style={{ fontWeight: '600' }}>{stat.value}</Typography>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openPaymentModal(item)}
                    disabled={recordPayment.isPending}
                    style={{
                      backgroundColor: theme.colors.success,
                      borderRadius: theme.radius.md,
                      paddingVertical: theme.spacing.sm,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={theme.colors.white} />
                    <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
                      Mark as Paid
                    </Typography>
                  </TouchableOpacity>
                </Card>
              );
            })}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={paymentModalVisible} onRequestClose={closePaymentModal}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: theme.spacing.base }}>
          <View style={{ backgroundColor: theme.colors.background, borderRadius: theme.radius['2xl'], padding: theme.spacing.base }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <Typography variant="headline2">Record Payment</Typography>
              <TouchableOpacity onPress={closePaymentModal}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <Typography variant="body" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.sm }}>
              Tenant: <Typography variant="bodyMedium">{selectedItem ? getTenant(selectedItem)?.fullName : ''}</Typography>
            </Typography>
            <Input
              label={`Amount (pending ₹${selectedItem ? getPendingAmount(selectedItem) : 0})`}
              placeholder="Enter amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              error={amountError}
            />
            <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm }}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <Button title="Cancel" variant="outline" onPress={closePaymentModal} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Record" loading={recordPayment.isPending} disabled={recordPayment.isPending} onPress={handlePay} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
