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
  Input,
  Button,
  ScreenHeader,
  TenantOverviewCard,
  PaymentStats,
  FilterSheet,
  Badge,
} from '../../src/components';
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'PARTIAL'>('ALL');
  const [filterOpen, setFilterOpen] = useState(false);
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
        if (ledgerTenantIds.has(tenant.id)) return false;
        const paidForMonth = (allMonthLedgers || []).some((l) => l.tenantId === tenant.id && l.status === 'PAID');
        return !paidForMonth;
      })
      .map((tenant) => ({ type: 'tenant', tenant, month: CURRENT_MONTH, year: CURRENT_YEAR }));

    return [...ledgerItems, ...tenantItems];
  }, [ledgers, tenants, allMonthLedgers]);

  const filtered = useMemo(() => {
    let result = items;
    if (statusFilter !== 'ALL') {
      result = result.filter((item) => {
        if (item.type === 'ledger') {
          return item.ledger.status === statusFilter;
        }
        return statusFilter === 'DUE';
      });
    }
    if (!search.trim()) return result;
    const q = search.toLowerCase();
    return result.filter((item) => {
      const tenant = item.type === 'ledger' ? item.ledger.tenant : item.tenant;
      const name = tenant?.fullName.toLowerCase() || '';
      const room = (tenant?.roomNumber || tenant?.bedNumber || '').toLowerCase();
      return name.includes(q) || room.includes(q);
    });
  }, [items, search, statusFilter]);

  const totalPending = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.type === 'ledger') {
          return sum + (item.ledger.rentAmount - (item.ledger.collectedAmount || 0));
        }
        return sum + ((item.tenant.rentPerMonth || 0) + (item.tenant.advanceAmount || 0));
      }, 0),
    [items]
  );

  const totalPartialPaid = useMemo(
    () => (ledgers || []).reduce((sum, d) => sum + (d.collectedAmount || 0), 0),
    [ledgers]
  );

  const getPendingAmount = useCallback((item: PendingItem) => {
    if (item.type === 'ledger') {
      return item.ledger.rentAmount - (item.ledger.collectedAmount || 0);
    }
    return (item.tenant.rentPerMonth || 0) + (item.tenant.advanceAmount || 0);
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

  const handleCall = async (phone?: string) => {
    if (!phone) return;
    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  const isLoading = ledgersLoading || tenantsLoading || monthLedgersLoading;

  useFocusEffect(
    useCallback(() => {
      refetchLedgers();
    }, [refetchLedgers])
  );

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Pending Payments"
        backgroundColor={theme.colors.warning}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => generateDues.mutate({ month: CURRENT_MONTH, year: CURRENT_YEAR })}
            disabled={generateDues.isPending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={generateDues.isPending ? 'refresh' : 'add-circle'} size={22} color={theme.colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar
                placeholder="Search by name or Room"
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
                backgroundColor: statusFilter !== 'ALL' ? theme.colors.warningSurface : theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: statusFilter !== 'ALL' ? theme.colors.warning : theme.colors.border,
              }}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color={statusFilter !== 'ALL' ? theme.colors.warning : theme.colors.text}
              />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <TenantOverviewCard
              label="Pending Dues"
              value={`₹${totalPending.toLocaleString()}`}
              icon="wallet-outline"
              color={theme.colors.warning}
              bg={theme.colors.warningSurface}
              style={{ flex: 1 }}
            />
            <TenantOverviewCard
              label="Partial Paid"
              value={`₹${totalPartialPaid.toLocaleString()}`}
              icon="swap-horizontal"
              color={theme.colors.success}
              bg={theme.colors.successSurface}
              style={{ flex: 1 }}
            />
          </View>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {!isLoading && filtered.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: theme.colors.warningSurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Ionicons name="cash-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <Typography variant="title1">No Pending Payments</Typography>
              <Typography variant="body" color={theme.colors.textMuted}>
                All Payments are up to Date.
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

              const displayName = tenant?.fullName || (isLedger ? 'Deleted Tenant' : 'Tenant');
              const roomLabel = tenant?.roomNumber || tenant?.bedNumber || '-';

              return (
                <Card key={isLedger ? item.ledger.id : item.tenant.id} shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.spacing.sm }}>
                      <Avatar uri={tenant?.avatar} name={tenant?.fullName} size={48} />
                      <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                        <Typography variant="title2">{displayName}</Typography>
                        <View style={{ marginTop: 4 }}>
                          <Badge label={`Room ${roomLabel}`} variant="primary" />
                        </View>
                      </View>
                    </View>
                    <Typography variant="title1" color={theme.colors.warning} style={{ fontWeight: '700' }}>
                      ₹{pending.toLocaleString()}
                    </Typography>
                  </View>

                  <PaymentStats total={rentAmount} partial={collectedAmount} pending={pending} />

                  <View style={{ flexDirection: 'row', marginTop: theme.spacing.md, gap: theme.spacing.md }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => openPaymentModal(item)}
                      disabled={recordPayment.isPending}
                      style={{
                        flex: 1,
                        backgroundColor: theme.colors.success,
                        borderRadius: theme.radius.full,
                        paddingVertical: theme.spacing.sm,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="checkmark-circle" size={18} color={theme.colors.white} />
                      <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
                        Mark as Paid
                      </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleCall(tenant?.phone)}
                      disabled={!tenant?.phone}
                      style={{
                        flex: 1,
                        backgroundColor: tenant?.phone ? theme.colors.primary : theme.colors.border,
                        borderRadius: theme.radius.full,
                        paddingVertical: theme.spacing.sm,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="call" size={18} color={theme.colors.white} />
                      <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
                        Call
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={paymentModalVisible} onRequestClose={closePaymentModal}>
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
                Mark as Paid
              </Typography>
              <TouchableOpacity onPress={closePaymentModal}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {getTenant(selectedItem)?.fullName || (selectedItem.type === 'ledger' ? 'Deleted Tenant' : 'Tenant')}
                </Typography>
                {getTenant(selectedItem)?.phone && (
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {getTenant(selectedItem)?.phone}
                  </Typography>
                )}
                <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm }}>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    Room {getTenant(selectedItem)?.roomNumber || getTenant(selectedItem)?.bedNumber || '-'}
                  </Typography>
                  {getTenant(selectedItem)?.bedNumber && (
                    <>
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ marginHorizontal: 8 }}>
                        •
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textMuted}>
                        Bed {getTenant(selectedItem)?.bedNumber}
                      </Typography>
                    </>
                  )}
                </View>
              </Card>
            )}

            <View
              style={{
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: theme.colors.borderLight,
                borderRadius: theme.radius.md,
                overflow: 'hidden',
                marginBottom: theme.spacing.md,
              }}
            >
              {[
                { label: 'Total Amount', value: `₹${selectedItem ? (selectedItem.type === 'ledger' ? selectedItem.ledger.rentAmount : selectedItem.tenant.rentPerMonth) : 0}` },
                { label: 'Pending', value: `₹${selectedItem ? getPendingAmount(selectedItem) : 0}` },
              ].map((stat, index, arr) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    paddingVertical: theme.spacing.sm,
                    alignItems: 'center',
                    borderRightWidth: index < arr.length - 1 ? 1 : 0,
                    borderRightColor: theme.colors.borderLight,
                  }}
                >
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {stat.label}
                  </Typography>
                  <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                    {stat.value}
                  </Typography>
                </View>
              ))}
            </View>

            <Input
              label="Amount *"
              placeholder="Enter amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              error={amountError}
            />

            <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm, gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="outline" onPress={closePaymentModal} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Confirm & Generate Receipt"
                  loading={recordPayment.isPending}
                  disabled={recordPayment.isPending}
                  onPress={handlePay}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Sort & Filter"
        selected={statusFilter}
        onSelect={(v) => setStatusFilter(v)}
        options={[
          { label: 'All', value: 'ALL', icon: 'apps-outline' },
          { label: 'Pending', value: 'DUE', icon: 'time-outline' },
          { label: 'Partial', value: 'PARTIAL', icon: 'cash-outline' },
        ]}
      />
    </ScreenWrapper>
  );
}
