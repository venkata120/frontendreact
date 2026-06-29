import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Card, StepIndicator, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useProperty } from '../../src/hooks/queries';

const STEPS = [
  { icon: 'person' as const },
  { icon: 'business' as const },
  { icon: 'checkmark' as const },
];

const FACILITIES = [
  { icon: 'wifi' as const, label: 'WiFi' },
  { icon: 'food' as const, label: 'Food' },
  { icon: 'television' as const, label: 'TV' },
  { icon: 'elevator-passenger' as const, label: 'Lift' },
  { icon: 'water' as const, label: 'Water' },
  { icon: 'thermometer' as const, label: 'Hot Water' },
  { icon: 'cctv' as const, label: 'CCTV' },
  { icon: 'locker' as const, label: 'Lockers' },
  { icon: 'shield-check' as const, label: 'Security' },
  { icon: 'desk-lamp' as const, label: 'Study Lamp' },
];

export default function ReviewDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user } = useAuth();
  const { data: property, isLoading } = useProperty(propertyId);

  const confirm = () => {
    router.replace('/(app)/(tabs)');
  };

  return (
    <ScreenWrapper backgroundColor="#8FA3B8">
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: theme.spacing.lg, width: 40 }}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>

            <StepIndicator steps={STEPS} currentStep={2} style={{ marginBottom: theme.spacing.xl }} />

            <View style={{ marginBottom: theme.spacing.lg }}>
              <Typography variant="headline2" color={theme.colors.white} align="center">
                Review Details
              </Typography>
              <Typography variant="body" color="rgba(255,255,255,0.8)" align="center" style={{ marginTop: theme.spacing.sm }}>
                Please check your complete details
              </Typography>
            </View>

            {isLoading && (
              <Typography variant="body" color={theme.colors.white} align="center">
                Loading details...
              </Typography>
            )}

            <View
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: theme.radius.xl,
                padding: theme.spacing.lg,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              {/* Owner Details */}
              <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Owner Details</Typography>
              <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                  <Avatar size={64} uri="" name={user?.name} />
                  <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                    <Typography variant="title1">{user?.name || 'Owner'}</Typography>
                    <Typography variant="caption" color={theme.colors.textMuted}>{user?.email}</Typography>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
                    <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
                    <Typography variant="bodyMedium" style={{ marginLeft: 8 }}>{user?.mobile || '-'}</Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <Ionicons name="card-outline" size={16} color={theme.colors.primary} />
                    <Typography variant="bodyMedium" style={{ marginLeft: 8 }}>{user?.id?.slice(0, 12)}</Typography>
                  </View>
                </View>
              </Card>

              {/* Property Details */}
              {property && (
                <>
                  <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Property Details</Typography>
                  <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
                    <View style={{ position: 'relative', marginBottom: theme.spacing.md }}>
                      <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
                        style={{ width: '100%', height: 160, borderRadius: theme.radius.lg }}
                        resizeMode="cover"
                      />
                      <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: theme.radius.full, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Typography variant="caption" color={theme.colors.white}>1/1</Typography>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                      <Typography variant="title1">{property.name}</Typography>
                      <Typography variant="bodyMedium" color={theme.colors.textMuted}>{property.pgType}</Typography>
                    </View>
                    <Typography variant="caption" color={theme.colors.textMuted}>{property.address}, {property.city}</Typography>
                    <View style={{ flexDirection: 'row', marginTop: theme.spacing.md }}>
                      <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: theme.colors.borderLight }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>City</Typography>
                        <Typography variant="bodyMedium" color={theme.colors.primary}>{property.city}</Typography>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>Type</Typography>
                        <Typography variant="bodyMedium" color={theme.colors.primary}>{property.pgType}</Typography>
                      </View>
                    </View>
                  </Card>
                </>
              )}

              {/* Facilities */}
              <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginBottom: theme.spacing.md }}>Facilities</Typography>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
                {FACILITIES.map((item) => (
                  <View key={item.label} style={{ alignItems: 'center', width: 56 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: theme.radius.md,
                        backgroundColor: theme.colors.primarySurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MaterialCommunityIcons name={item.icon} size={20} color={theme.colors.primary} />
                    </View>
                    <Typography variant="caption" color={theme.colors.text} style={{ marginTop: 4, textAlign: 'center' }}>{item.label}</Typography>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.white,
            paddingHorizontal: theme.spacing.base,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.lg,
          }}
        >
          <Button title="Confirm Details" onPress={confirm} />
        </View>
      </View>
    </ScreenWrapper>
  );
}
