import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Typography,
  SearchBar,
  TenantListItem,
  ScreenHeader,
  Button,
} from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useProperties, useTenantsWithRooms } from '../../src/hooks/queries';

export default function LeftTenantsProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPg, setSelectedPg } = useSelectedPg();
  const { data: properties } = useProperties(user?.id);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!properties || properties.length === 0) return;
    const match = selectedPg?.id ? properties.find((p) => p.id === selectedPg.id) : undefined;
    if (match) {
      if (!selectedPg || selectedPg.id !== match.id || selectedPg.name !== match.name) {
        setSelectedPg(match);
      }
    } else if (!selectedPg) {
      setSelectedPg(properties[0]);
    }
  }, [properties, selectedPg, setSelectedPg]);

  const { data: tenants, isLoading } = useTenantsWithRooms(selectedPg?.id);
  const leftTenants = useMemo(
    () =>
      tenants
        ?.filter((t) => t.status === 'EXITED')
        .filter(
          (t) =>
            t.fullName.toLowerCase().includes(search.toLowerCase()) ||
            (t.roomNumber && t.roomNumber.toLowerCase().includes(search.toLowerCase())) ||
            (t.bedNumber && t.bedNumber.toLowerCase().includes(search.toLowerCase()))
        ) || [],
    [tenants, search]
  );

  return (
    <ScreenWrapper>
      <ScreenHeader
        title="Left Tenants"
        backgroundColor="#0A2A5E"
        textColor={theme.colors.white}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <SearchBar
            placeholder="Search by name or Room"
            value={search}
            onChangeText={setSearch}
            style={{ marginHorizontal: 0, marginVertical: 0, marginBottom: theme.spacing.md }}
          />

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {!isLoading && leftTenants.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: theme.colors.backgroundSecondary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Ionicons name="person-remove-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <Typography variant="title1">No Left Tenants Found</Typography>
              <Typography variant="body" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.lg }}>
                All Tenants are currently Active.
              </Typography>
              <Button title="See Tenants" onPress={() => router.replace('/(app)/(tabs)/tenants')} />
            </View>
          )}

          {!isLoading &&
            leftTenants.map((tenant) => (
              <TenantListItem
                key={tenant.id}
                tenant={tenant}
                variant="left"
                onPress={() => router.push({ pathname: '/screens/tenants-profile' as any, params: { id: tenant.id } })}
              />
            ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
