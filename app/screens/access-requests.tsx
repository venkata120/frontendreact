import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const STATUS_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function AccessRequestsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Access requests are not yet supported by the backend; this keeps the pull-to-refresh gesture responsive.
    setTimeout(() => setRefreshing(false), 500);
  }, []);

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
          <Typography variant="headline2" color={theme.colors.white}>Access requests</Typography>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.md }}
        >
          {STATUS_OPTIONS.map((option) => {
            const selected = statusFilter === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.8}
                onPress={() => setStatusFilter(option.value)}
                style={{
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.radius.full,
                  backgroundColor: selected ? theme.colors.primary : theme.colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  marginRight: theme.spacing.sm,
                }}
              >
                <Typography variant="bodyMedium" color={selected ? theme.colors.white : theme.colors.text}>
                  {option.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ padding: theme.spacing.base, alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg }}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textMuted} />
          </View>
          <Typography variant="title1">No access requests</Typography>
          <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}>
            Manager access is currently granted directly by the owner. Pending approval requests will appear here once supported.
          </Typography>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
