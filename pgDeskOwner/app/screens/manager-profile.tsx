import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useManagerAssignmentsByPg, useRemoveManager } from '../../src/hooks/queries';

export default function ManagerProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPg } = useSelectedPg();
  const { data: assignments, isLoading } = useManagerAssignmentsByPg(selectedPg?.id);
  const removeManager = useRemoveManager();

  const assignment = assignments?.[0];

  const handleRemove = async () => {
    if (!assignment) return;
    await removeManager.mutateAsync({ managerId: assignment.managerId, pgId: assignment.pgId });
  };

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

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="lg" padding={theme.spacing.lg} style={{ alignItems: 'center' }}>
            <Avatar size={100} uri="" name={assignment?.managerName || 'Manager'} />
            <Typography variant="headline2" style={{ marginTop: theme.spacing.md }}>{assignment?.managerName || 'Manager'}</Typography>
            <Typography variant="body" color={theme.colors.textMuted}>{assignment?.managerEmail || selectedPg?.name || 'SV Mens PG'}</Typography>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', marginTop: theme.spacing.lg }}>
              {[
                { label: 'Last Login', value: 'Today', icon: 'phone-portrait', color: '#A855F7' },
                { label: 'Tenants Added', value: '0', icon: 'people', color: '#22C55E' },
                { label: 'Collected Payments', value: '₹ 0', icon: 'cash', color: '#22C55E' },
                { label: 'Vacates', value: '0', icon: 'exit', color: '#F97316' },
              ].map((stat) => (
                <Card key={stat.label} shadow="sm" padding={theme.spacing.sm} style={{ width: '48%', marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={stat.icon as any} size={20} color={stat.color} style={{ marginRight: 8 }} />
                    <View>
                      <Typography variant="caption" color={theme.colors.textMuted}>{stat.label}</Typography>
                      <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{stat.value}</Typography>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </Card>

          {[
            { label: 'Manager information', icon: 'person', color: '#0065F4', route: '' },
            { label: 'Manager Permissions', icon: 'remove-circle', color: '#0065F4', route: '/screens/manage-all-permissions' },
            { label: 'Access Requests', icon: 'key', color: '#0065F4', route: '/screens/access-requests' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={() => item.route && router.push(item.route as any)}
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

          {assignment && (
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
          )}

          {isLoading && (
            <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.md }}>Loading manager...</Typography>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
