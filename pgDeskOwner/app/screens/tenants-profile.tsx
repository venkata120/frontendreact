import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant, useDeleteTenant, useUpdateBedStatus } from '../../src/hooks/queries';
import { getApiErrorMessage } from '../../src/utils/validation';

export default function TenantsProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tenant, isLoading } = useTenant(id);
  const deleteTenant = useDeleteTenant();
  const updateBedStatus = useUpdateBedStatus();

  const handleCall = async (phone?: string) => {
    if (!phone) return;
    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Tenant',
      'Are you sure you want to delete this tenant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await deleteTenant.mutateAsync(id);
              if (tenant?.bedId) {
                await updateBedStatus.mutateAsync({ id: tenant.bedId, status: 'VACANT' });
              }
              router.back();
            } catch (err: any) {
              Alert.alert('Error', getApiErrorMessage(err, 'Failed to delete tenant'));
            }
          },
        },
      ]
    );
  };

  const infoItems = tenant
    ? [
        { label: 'Floor', value: `Floor ${tenant.floor ?? '-'}`, icon: 'trail-sign-outline' },
        { label: 'Room Number', value: tenant.roomNumber || '-', icon: 'bed-outline' },
        { label: 'Bed Number', value: tenant.bedId?.slice(-4) || '-', icon: 'checkbox-outline' },
        { label: 'Date of Check-in', value: tenant.joinDate, icon: 'calendar-outline' },
        { label: 'Rent Amount', value: `₹ ${tenant.rentPerMonth.toLocaleString()}`, icon: 'cash-outline' },
        { label: 'Phone', value: tenant.phone, icon: 'call-outline' },
        { label: 'Email', value: tenant.email || '-', icon: 'mail-outline' },
        { label: 'Emergency Contact', value: tenant.emergencyContact || '-', icon: 'people-outline' },
      ]
    : [];

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <Typography variant="headline2" color={theme.colors.white}>Tenant Details</Typography>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/screens/edit-tenant' as any, params: { id } })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.success,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 6,
                borderRadius: theme.radius.full,
                marginRight: theme.spacing.sm,
              }}
            >
              <Ionicons name="create-outline" size={14} color={theme.colors.white} />
              <Typography variant="caption" color={theme.colors.white} style={{ marginLeft: 4, fontWeight: '600' }}>Edit</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleDelete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.danger,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 6,
                borderRadius: theme.radius.full,
              }}
            >
              <Ionicons name="trash-outline" size={14} color={theme.colors.white} />
              <Typography variant="caption" color={theme.colors.white} style={{ marginLeft: 4, fontWeight: '600' }}>Delete</Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar size={70} uri="" name={tenant?.fullName} />
              <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <Typography variant="title1">{tenant?.fullName}</Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tenant?.status === 'ACTIVE' ? theme.colors.success : theme.colors.textMuted, marginRight: 4 }} />
                  <Typography variant="caption" color={tenant?.status === 'ACTIVE' ? theme.colors.success : theme.colors.textMuted}>
                    {tenant?.status === 'ACTIVE' ? 'Active' : 'Exited'}
                  </Typography>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.8} onPress={() => handleCall(tenant?.phone)}>
                <Ionicons name="call" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </Card>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading details...</Typography>}

          <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.xl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="person-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title2">Tenant information</Typography>
            </View>
            {infoItems.map((item) => (
              <View
                key={item.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.borderLight,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={item.icon as any} size={18} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
                  <Typography variant="body" color={theme.colors.textMuted}>{item.label}</Typography>
                </View>
                <Typography variant="bodyMedium" color={theme.colors.primary}>{item.value}</Typography>
              </View>
            ))}
          </Card>

          {tenant && tenant.rentLedgers && tenant.rentLedgers.length > 0 && (
            <Card shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.xl }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Ionicons name="cash-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Typography variant="title2">Rent History</Typography>
              </View>
              {tenant.rentLedgers.map((ledger) => (
                <View key={ledger.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
                  <Typography variant="bodyMedium">{ledger.rentMonth}/{ledger.rentYear}</Typography>
                  <Typography variant="bodyMedium" color={ledger.status === 'PAID' ? theme.colors.success : ledger.status === 'PARTIAL' ? theme.colors.warning : theme.colors.danger}>
                    ₹{ledger.rentAmount.toLocaleString()} ({ledger.status})
                  </Typography>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
