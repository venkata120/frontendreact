import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { useMemo, useState } from 'react';
import { ScreenWrapper, ScreenHeader, SearchBar, Typography, TenantListItem } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useActiveTenantsWithRooms } from '../../src/hooks/queries/useActiveTenantsWithRooms';

export default function ActiveTenantsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { pgId } = useLocalSearchParams<{ pgId?: string }>();
  const [search, setSearch] = useState('');
  const { data: tenants, isLoading } = useActiveTenantsWithRooms(pgId || undefined);

  const filtered = useMemo(() => {
    if (!tenants) return [];
    if (!search.trim()) return tenants;
    const q = search.trim().toLowerCase();
    return tenants.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        (t.roomNumber && t.roomNumber.toLowerCase().includes(q)) ||
        (t.bedNumber && t.bedNumber.toLowerCase().includes(q))
    );
  }, [tenants, search]);

  return (
    <ScreenWrapper edges={['bottom', 'left', 'right']}>
      <ScreenHeader
        title="Active Tenants"
        backgroundColor={theme.colors.primary}
        onBack={() =>
          router.canGoBack()
            ? router.back()
            : router.replace(user?.role === 'manager' ? '/(app)/(manager-tabs)' : '/(app)/(tabs)')
        }
      />

      <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base }}>
        <SearchBar
          placeholder="Search by name or room"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: theme.spacing.base,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.xl,
        }}
      >
        {isLoading ? (
          <Typography variant="body" color={theme.colors.textMuted}>
            Loading active tenants...
          </Typography>
        ) : filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
            <Typography variant="title1">No active tenants</Typography>
            <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
              {search.trim()
                ? 'No matches found for your search.'
                : 'There are no active tenants right now.'}
            </Typography>
          </View>
        ) : (
          filtered.map((tenant) => (
            <TenantListItem
              key={tenant.id}
              tenant={tenant}
              variant="active"
              onPress={() =>
                router.push({
                  pathname: '/screens/tenants-profile' as any,
                  params: { id: tenant.id },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
