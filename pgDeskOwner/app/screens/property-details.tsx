import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useProperty, useDeleteProperty, useProperties } from '../../src/hooks/queries';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';

export default function PropertyDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { selectedPg } = useSelectedPg();
  const { data: propertyById, isLoading } = useProperty(id || selectedPg?.id);
  const { data: properties } = useProperties(user?.id);
  const deleteProperty = useDeleteProperty();

  const property = propertyById || selectedPg || (properties && properties.length > 0 ? properties[0] : undefined);
  const hasProperty = !!property;

  const handleDelete = () => {
    if (!property?.id) return;
    Alert.alert(
      'Delete Property',
      'Are you sure you want to delete this property?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProperty.mutateAsync(property.id);
            router.replace('/(app)/(tabs)');
          },
        },
      ]
    );
  };

  const infoItems = property
    ? [
        { label: 'Name', value: property.name, icon: 'business', color: theme.colors.primary },
        { label: 'City', value: property.city, icon: 'location', color: '#4F39F6' },
        { label: 'Type', value: property.pgType, icon: 'people', color: '#00A63E' },
        { label: 'Status', value: 'Active', icon: 'checkbox', color: '#00A63E' },
      ]
    : [];

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.secondary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>
            Property Details
          </Typography>
          {hasProperty ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/screens/add-property' as any, params: { id: property.id } })}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Ionicons name="create-outline" size={18} color={theme.colors.white} />
              <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 4 }}>Edit</Typography>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          {!hasProperty && !isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: theme.colors.primarySurface, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.lg }}>
                <Ionicons name="business-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <Typography variant="title1">No property found</Typography>
              <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}>
                Please create a property using the Create Property option.
              </Typography>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/screens/add-property' as any)}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.md,
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.xl,
                  marginTop: theme.spacing.lg,
                }}
              >
                <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>Create Property</Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Typography variant="title1" style={{ marginBottom: theme.spacing.md, marginTop: theme.spacing.base }}>Property Image</Typography>
              <View style={{ position: 'relative', marginBottom: theme.spacing.lg }}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
                  style={{ width: '100%', height: 180, borderRadius: theme.radius.lg }}
                  resizeMode="cover"
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: theme.radius.full,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Typography variant="caption" color={theme.colors.white}>1/1</Typography>
                </View>
              </View>

              <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Property Information</Typography>

              {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

              {infoItems.map((item) => (
                <Card key={item.label} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} style={{ marginRight: 12 }} />
                      <Typography variant="bodyMedium">{item.label}</Typography>
                    </View>
                    <Typography variant="bodyMedium" color={item.label === 'Status' ? theme.colors.success : theme.colors.text}>
                      {item.value}
                    </Typography>
                  </View>
                </Card>
              ))}

              <Typography variant="title1" style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}>Address</Typography>
              <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.xl }}>
                <Typography variant="bodyMedium">{property?.address}</Typography>
              </Card>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                disabled={deleteProperty.isPending}
                style={{
                  backgroundColor: theme.colors.danger,
                  borderRadius: theme.radius.md,
                  paddingVertical: theme.spacing.md,
                  alignItems: 'center',
                  marginBottom: theme.spacing.xl,
                }}
              >
                <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>
                  {deleteProperty.isPending ? 'Deleting...' : 'Delete Property'}
                </Typography>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
