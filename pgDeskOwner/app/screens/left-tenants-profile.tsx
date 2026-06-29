import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, Avatar } from '../../src/components';
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
    if (properties && properties.length > 0 && !selectedPg?.name) {
      setSelectedPg(properties[0]);
    }
  }, [properties, selectedPg, setSelectedPg]);

  const { data: tenants, isLoading } = useTenantsWithRooms(selectedPg?.id);
  const leftTenants = useMemo(
    () => tenants?.filter((t) => t.status === 'EXITED').filter((t) => t.fullName.toLowerCase().includes(search.toLowerCase()) || (t.roomNumber && t.roomNumber.includes(search))) || [],
    [tenants, search]
  );

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: '#0A2A5E',
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
          <Ionicons name="arrow-back" size={20} color="#0A2A5E" />
        </TouchableOpacity>
        <Typography variant="headline2" color={theme.colors.white}>Left Tenants</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <SearchBar placeholder="Search by name or Room" value={search} onChangeText={setSearch} />

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {leftTenants.map((tenant) => (
            <Card key={tenant.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md, backgroundColor: '#F6F6F6' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar uri="" name={tenant.fullName} size={56} />
                  <View style={{ marginLeft: theme.spacing.md }}>
                    <Typography variant="title3" color={theme.colors.textMuted}>{tenant.fullName}</Typography>
                    <View style={{ backgroundColor: '#D9D9D9', borderRadius: theme.radius.sm, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginVertical: 4 }}>
                      <Typography variant="caption" color={theme.colors.white}>Room {tenant.roomNumber || '-'}</Typography>
                    </View>
                    <Typography variant="bodyMedium" color={theme.colors.textMuted}>₹{tenant.rentPerMonth.toLocaleString()}/month</Typography>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
