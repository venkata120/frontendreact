import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Typography,
  Card,
  Avatar,
  Button,
  ScreenHeader,
  InfoRow,
  StatusBadge,
  ConfirmDialog,
} from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant, useDeleteTenant, useUpdateBedStatus } from '../../src/hooks/queries';
import { getApiErrorMessage } from '../../src/utils/validation';
import { callPhone } from '../../src/utils/uiHelpers';
import { useState, useMemo } from 'react';

export default function TenantsProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tenant, isLoading } = useTenant(id);
  const deleteTenant = useDeleteTenant();
  const updateBedStatus = useUpdateBedStatus();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isExited = tenant?.status === 'EXITED';
  const receivedPayments = useMemo(
    () => (tenant?.rentLedgers || []).filter((l) => l.status === 'PAID').length,
    [tenant?.rentLedgers]
  );

  const handleCall = (phone?: string) => {
    callPhone(phone);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteTenant.mutateAsync(id);
      if (tenant?.bedId) {
        await updateBedStatus.mutateAsync({ id: tenant.bedId, status: 'VACANT' });
      }
      setConfirmDelete(false);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Error', getApiErrorMessage(err, 'Failed to remove tenant'));
    }
  };

  const infoRows = useMemo(
    () =>
      tenant
        ? [
            { label: 'Floor', value: tenant.floor ? `Floor ${tenant.floor}` : '-', icon: 'trail-sign-outline' as const },
            { label: 'Room Number', value: tenant.roomNumber || '-', icon: 'bed-outline' as const },
            { label: 'Bed Number', value: tenant.bedNumber || tenant.bedId?.slice(-4) || '-', icon: 'checkbox-outline' as const },
            { label: 'Date of Check-in', value: tenant.joinDate ? new Date(tenant.joinDate).toLocaleDateString('en-GB') : '-', icon: 'calendar-outline' as const },
            { label: 'Rent Amount', value: `₹ ${tenant.rentPerMonth.toLocaleString()}`, icon: 'cash-outline' as const, valueColor: theme.colors.primary },
            { label: 'Deposit Amount', value: tenant.advanceAmount ? `₹ ${tenant.advanceAmount.toLocaleString()}` : '-', icon: 'wallet-outline' as const },
            { label: 'Maintenance Amount', value: '-', icon: 'construct-outline' as const },
            { label: 'Refundable Amount', value: '-', icon: 'refresh-outline' as const },
          ]
        : [],
    [tenant, theme]
  );

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Tenant Details"
        backgroundColor={theme.colors.primary}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
        rightAction={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!isExited && receivedPayments > 0 && (
              <View
                style={{
                  backgroundColor: theme.colors.success,
                  borderRadius: theme.radius.full,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: 4,
                  marginRight: theme.spacing.sm,
                }}
              >
                <Typography variant="captionMedium" color={theme.colors.white}>
                  Received payments {receivedPayments}
                </Typography>
              </View>
            )}
            {isExited ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setConfirmDelete(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.colors.danger,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="trash-outline" size={18} color={theme.colors.white} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/screens/edit-tenant' as any, params: { id } })}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar size={70} uri={tenant?.avatar} name={tenant?.fullName} />
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Typography variant="title1">{tenant?.fullName}</Typography>
                {tenant?.status && <StatusBadge status={tenant.status} />}
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCall(tenant?.phone)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.colors.primarySurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="call" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading details...</Typography>}

          <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="person-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title2">Tenant information</Typography>
            </View>
            {infoRows.map((item, index) => (
              <InfoRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
                valueColor={item.valueColor}
                isLast={index === infoRows.length - 1}
              />
            ))}
          </Card>

          {tenant && tenant.rentLedgers && tenant.rentLedgers.length > 0 && (
            <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Ionicons name="cash-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Typography variant="title2">Rent History</Typography>
              </View>
              {tenant.rentLedgers.map((ledger, index) => (
                <View
                  key={ledger.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: index === tenant.rentLedgers!.length - 1 ? 0 : 1,
                    borderBottomColor: theme.colors.borderLight,
                  }}
                >
                  <Typography variant="bodyMedium">
                    {ledger.rentMonth}/{ledger.rentYear}
                  </Typography>
                  <Typography
                    variant="bodyMedium"
                    color={
                      ledger.status === 'PAID'
                        ? theme.colors.success
                        : ledger.status === 'PARTIAL'
                        ? theme.colors.warning
                        : theme.colors.danger
                    }
                  >
                    ₹{ledger.rentAmount.toLocaleString()} ({ledger.status})
                  </Typography>
                </View>
              ))}
            </Card>
          )}

          {isExited && (
            <View style={{ marginBottom: theme.spacing.lg }}>
              <Button
                title="Payment History"
                variant="outline"
                leftIcon={<Ionicons name="time-outline" size={20} color={theme.colors.primary} />}
                onPress={() => router.push('/screens/collected-amount' as any)}
                style={{ marginBottom: theme.spacing.md }}
              />
              <Button
                title="Remove from Records"
                variant="danger"
                leftIcon={<Ionicons name="trash-outline" size={20} color={theme.colors.white} />}
                onPress={() => setConfirmDelete(true)}
              />
            </View>
          )}

          <View style={{ height: theme.spacing.xl }} />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={confirmDelete}
        title={isExited ? 'Remove from Records' : 'Delete Tenant'}
        message={
          isExited
            ? 'This tenant will be removed from your records. This action cannot be undone.'
            : 'Are you sure you want to delete this tenant?'
        }
        confirmText={isExited ? 'Delete' : 'Delete'}
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </ScreenWrapper>
  );
}
