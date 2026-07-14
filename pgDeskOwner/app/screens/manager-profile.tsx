import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, ProfileImagePicker } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';

import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useManagerAssignmentsByPg, useRemoveManager, useManagers } from '../../src/hooks/queries';
import type { ManagerPgAssignment } from '../../src/types';

interface DisplayInfo {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
}

export default function ManagerProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();
  const { managerId } = useLocalSearchParams<{ managerId?: string }>();

  const { data: assignments, isLoading: assignmentsLoading, refetch: refetchAssignments } = useManagerAssignmentsByPg(selectedPg?.id);
  const { data: managers, isLoading: managersLoading } = useManagers(user?.id);
  const removeManager = useRemoveManager();

  const selectedManager = managerId ? managers?.find((m) => m.id === managerId) : undefined;
  const assignmentForSelected = managerId
    ? assignments?.find((a) => a.managerId === managerId)
    : undefined;

  const assignment: ManagerPgAssignment | undefined = selectedManager
    ? assignmentForSelected
    : assignments?.[0];

  const displayInfo: DisplayInfo | undefined = (() => {
    if (selectedManager) {
      return {
        id: selectedManager.id,
        name: selectedManager.name,
        email: selectedManager.email,
        mobile: selectedManager.mobile,
      };
    }
    if (assignment) {
      return {
        id: assignment.managerId,
        name: assignment.managerName,
        email: assignment.managerEmail,
      };
    }
    return undefined;
  })();

  const isLoading = managersLoading || assignmentsLoading;

  const handleRemove = async () => {
    if (!assignment) return;
    Alert.alert(
      'Remove Manager',
      `Are you sure you want to remove ${displayInfo?.name || 'this manager'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeManager.mutateAsync({ managerId: assignment.managerId, pgId: assignment.pgId });
              await qc.invalidateQueries({ queryKey: ['managers'] });
              await qc.invalidateQueries({ queryKey: ['manager-assignments'] });
              await refetchAssignments();
              if (user?.id) {
                await qc.refetchQueries({ queryKey: ['managers', user.id] });
              }
              Alert.alert('Removed', 'Manager has been removed successfully');
              if (managerId) {
                router.replace('/screens/manager-profile');
              }
            } catch {
              Alert.alert('Error', 'Failed to remove manager. Please try again.');
            }
          },
        },
      ]
    );
  };

  const showManagerInfo = () => {
    if (!displayInfo) return;
    Alert.alert(
      'Manager Information',
      `Name: ${displayInfo.name || 'N/A'}\nEmail: ${displayInfo.email || 'N/A'}\nPhone: ${displayInfo.mobile || 'N/A'}`
    );
  };

  const statCards = [
    { label: 'Last Login', value: '—', icon: 'phone-portrait', color: '#A855F7' },
    { label: 'Tenants Added', value: '—', icon: 'people', color: '#22C55E', route: '/(app)/(tabs)/tenants' },
    { label: 'Collected Payments', value: '—', icon: 'cash', color: '#22C55E', route: '/screens/collected-amount' },
    { label: 'Vacates', value: '—', icon: 'exit', color: '#F97316', route: '/screens/left-tenants-profile' },
  ];

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: '#0A2A5E',
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)')}
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
            <Ionicons name="arrow-back" size={20} color="#0A2A5E" />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>Manager Profile</Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg} style={{ alignItems: 'center' }}>
            <ProfileImagePicker
              size={100}
              name={displayInfo?.name || 'Manager'}
              profileType="MANAGER"
              entityId={displayInfo?.id}
              onUploaded={(result) => {
                console.log('[ManagerProfile] uploaded', result.objectUrl);
              }}
            />
            <Typography variant="headline2" style={{ marginTop: theme.spacing.md }}>{displayInfo?.name || displayInfo?.email || 'No Manager Assigned'}</Typography>
            <Typography variant="body" color={theme.colors.textMuted}>{displayInfo?.email || selectedPg?.name || 'Assign a manager to manage this property'}</Typography>

            {displayInfo && (
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  width: '100%',
                  marginTop: theme.spacing.lg,
                  justifyContent: 'space-between',
                }}
              >
                {statCards.map((stat) => (
                  <TouchableOpacity
                    key={stat.label}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (stat.route) {
                        router.push(stat.route as any);
                      } else {
                        Alert.alert(stat.label, 'Manager statistics will be available in a future update.');
                      }
                    }}
                    style={{ width: '48%', marginBottom: theme.spacing.md }}
                  >
                    <Card shadow="sm" padding={theme.spacing.sm} minHeight={72} style={{ justifyContent: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name={stat.icon as any} size={20} color={stat.color} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Typography variant="caption" color={theme.colors.textMuted} numberOfLines={1} ellipsizeMode="tail">{stat.label}</Typography>
                          <Typography variant="bodyMedium" style={{ fontWeight: '600' }} numberOfLines={1} ellipsizeMode="tail">{stat.value}</Typography>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {assignment ? (
            <>
              {[
                { label: 'Manager information', icon: 'person', color: '#0065F4', onPress: showManagerInfo },
                { label: 'Manager Permissions', icon: 'remove-circle', color: '#0065F4', route: '/screens/manage-all-permissions' },
                { label: 'Access Requests', icon: 'key', color: '#0065F4', route: '/screens/access-requests' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.onPress) {
                      item.onPress();
                    } else if (item.route) {
                      router.push(item.route as any);
                    }
                  }}
                  style={{ marginTop: theme.spacing.md }}
                >
                  <Card shadow="sm" padding={theme.spacing.md}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name={item.icon as any} size={22} color={item.color} style={{ marginRight: 12 }} />
                        <Typography variant="bodyMedium">{item.label}</Typography>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleRemove}
                disabled={removeManager.isPending}
                style={{
                  backgroundColor: theme.colors.danger,
                  borderRadius: theme.radius.md,
                  paddingVertical: theme.spacing.md,
                  alignItems: 'center',
                  marginTop: theme.spacing.lg,
                }}
              >
                <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>
                  {removeManager.isPending ? 'Removing...' : 'Remove Manager'}
                </Typography>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/screens/assign-manager' as any)}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.md,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
                marginTop: theme.spacing.lg,
              }}
            >
              <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>
                Assign Manager
              </Typography>
            </TouchableOpacity>
          )}

          {isLoading && (
            <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.md }}>Loading manager...</Typography>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
