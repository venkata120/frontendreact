import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useProperties } from '../../src/hooks/queries';
import { useSelectedPg } from '../../src/context/SelectedPgContext';

export default function SelectPropertyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { setSelectedPg } = useSelectedPg();
  const { data: properties, isLoading } = useProperties(user?.id);

  const handleSelect = (property: any) => {
    setSelectedPg(property);
    router.navigate({ pathname: '/screens/add-property', params: { propertyId: property.id } } as any);
  };

  return (
    <ScreenWrapper>
      <Header
        title="My Properties"
        subtitle="Select a property to manage"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          {isLoading ? (
            <Typography variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', marginTop: theme.spacing.xl }}>
              Loading properties...
            </Typography>
          ) : properties && properties.length > 0 ? (
            properties.map((property) => (
              <TouchableOpacity
                key={property.id}
                activeOpacity={0.8}
                onPress={() => handleSelect(property)}
                style={{ marginBottom: theme.spacing.md }}
              >
                <Card shadow="md" padding={theme.spacing.md}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar size={56} uri="" name={property.name} />
                    <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                      <Typography variant="title2" numberOfLines={1} ellipsizeMode="tail">
                        {property.name}
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textMuted} numberOfLines={1} ellipsizeMode="tail">
                        {property.address || property.city || 'No address'}
                      </Typography>
                      <Typography variant="caption" color={theme.colors.primary} style={{ marginTop: 2 }}>
                        {property.pgType}
                      </Typography>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: theme.spacing['3xl'] }}>
              <Ionicons name="business-outline" size={48} color={theme.colors.border} />
              <Typography variant="title1" style={{ marginTop: theme.spacing.md }}>
                No properties found
              </Typography>
              <Typography variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', marginTop: theme.spacing.sm }}>
                Create a property to get started.
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
