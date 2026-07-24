import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Input, Button, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useActiveTenantsByPg, useRecordCollectedPayment } from '../../src/hooks/queries';
import { useState, useMemo } from 'react';
import type { Tenant } from '../../src/types';

const now = new Date();
const CURRENT_MONTH = String(now.getMonth() + 1).padStart(2, '0');
const CURRENT_YEAR = String(now.getFullYear());

const PAYMENT_MODES = ['Cash', 'UPI', 'Bank transfer', 'Card'];

export default function AddPaymentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectedPg } = useSelectedPg();
  const { data: tenants, isLoading: tenantsLoading } = useActiveTenantsByPg(selectedPg?.id);
  const recordPayment = useRecordCollectedPayment();

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantModalVisible, setTenantModalVisible] = useState(false);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredTenants = useMemo(() => {
    return tenants || [];
  }, [tenants]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!selectedTenant) next.tenant = 'Select a tenant';
    if (!month || month.length !== 2 || Number(month) < 1 || Number(month) > 12) {
      next.month = 'Enter valid month (01-12)';
    }
    if (!year || year.length !== 4) next.year = 'Enter valid year';
    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) next.amount = 'Enter valid amount';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !selectedTenant) return;
    await recordPayment.mutateAsync({
      tenant: selectedTenant,
      month,
      year: Number(year),
      amount: parseFloat(amount),
      mode,
    });
    router.back();
  };

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
        <Typography variant="headline2" color={theme.colors.white}>Record Payment</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.md }}>
            <Typography variant="title2" style={{ marginBottom: theme.spacing.md }}>Tenant</Typography>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTenantModalVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: theme.spacing.md,
                borderWidth: 1,
                borderColor: errors.tenant ? theme.colors.danger : theme.colors.border,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.backgroundSecondary,
              }}
            >
              {selectedTenant ? (
                <>
                  <Avatar uri="" name={selectedTenant.fullName} size={40} />
                  <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{selectedTenant.fullName}</Typography>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      Room {selectedTenant.roomNumber || selectedTenant.bedNumber || '-'} · ₹{selectedTenant.rentPerMonth.toLocaleString()}
                    </Typography>
                  </View>
                </>
              ) : (
                <Typography variant="body" color={theme.colors.textMuted}>Select tenant</Typography>
              )}
              <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
            {errors.tenant && (
              <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: 4 }}>
                {errors.tenant}
              </Typography>
            )}

            <View style={{ flexDirection: 'row', marginTop: theme.spacing.md }}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <Input
                  label="Month (MM)"
                  placeholder="06"
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="numeric"
                  maxLength={2}
                  error={errors.month}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Year (YYYY)"
                  placeholder="2026"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  maxLength={4}
                  error={errors.year}
                />
              </View>
            </View>

            <Input
              label="Amount *"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              error={errors.amount}
              containerStyle={{ marginTop: theme.spacing.md }}
            />

            <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
              Payment mode
            </Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {PAYMENT_MODES.map((m) => (
                <TouchableOpacity
                  key={m}
                  activeOpacity={0.8}
                  onPress={() => setMode(m)}
                  style={{
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.radius.full,
                    backgroundColor: mode === m ? theme.colors.success : theme.colors.backgroundSecondary,
                    borderWidth: 1,
                    borderColor: mode === m ? theme.colors.success : theme.colors.border,
                    marginRight: theme.spacing.sm,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <Typography variant="bodyMedium" color={mode === m ? theme.colors.white : theme.colors.text}>
                    {m}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Button
            title="Record Payment"
            loading={recordPayment.isPending}
            disabled={recordPayment.isPending || tenantsLoading}
            onPress={handleSubmit}
            leftIcon={<Ionicons name="checkmark-circle" size={18} color={theme.colors.white} />}
          />
        </View>
      </ScrollView>

      <Modal visible={tenantModalVisible} transparent animationType="slide" onRequestClose={() => setTenantModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, paddingBottom: 24, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.base, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
              <Typography variant="title1">Select Tenant</Typography>
              <TouchableOpacity onPress={() => setTenantModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {tenantsLoading ? (
              <Typography variant="body" color={theme.colors.textMuted} style={{ padding: theme.spacing.base }}>Loading tenants...</Typography>
            ) : (
              <FlatList
                data={filteredTenants}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedTenant(item);
                      setTenantModalVisible(false);
                    }}
                    style={{
                      padding: theme.spacing.base,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.borderLight,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar uri="" name={item.fullName} size={40} />
                    <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                      <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{item.fullName}</Typography>
                      <Typography variant="caption" color={theme.colors.textMuted}>
                        Room {item.roomNumber || item.bedNumber || '-'} · ₹{item.rentPerMonth.toLocaleString()}
                      </Typography>
                    </View>
                    {selectedTenant?.id === item.id && <Ionicons name="checkmark" size={20} color={theme.colors.success} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={(
                  <View style={{ padding: theme.spacing.base, alignItems: 'center' }}>
                    <Typography variant="body" color={theme.colors.textMuted}>No active tenants found</Typography>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
