import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Card, StepIndicator, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useProperty, useDownloadProfileImage, useRoomsByPg } from '../../src/hooks/queries';

const STEPS = [
  { icon: 'person' as const },
  { icon: 'business' as const },
  { icon: 'checkmark' as const },
];

const PG_TYPE_LABEL: Record<string, string> = {
  MEN: 'Boys',
  LADIES: 'Girls',
  CO_LIVE: 'Co-Living',
};

export default function ReviewDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const { user } = useAuth();
  const { selectedPg } = useSelectedPg();

  const effectivePropertyId = propertyId || selectedPg?.id;
  const { data: property, isLoading: propertyLoading } = useProperty(effectivePropertyId);
  const { data: propertyImageDownload } = useDownloadProfileImage(effectivePropertyId, 'PG', 'profiles', {
    enabled: !!effectivePropertyId,
  });
  const { data: ownerImageDownload } = useDownloadProfileImage(user?.id, 'OWNER', 'profiles', {
    enabled: !!user?.id,
  });
  const { data: rooms } = useRoomsByPg(effectivePropertyId);

  const propertyImageUrl = propertyImageDownload?.presignedUrl;
  const ownerImageUrl = ownerImageDownload?.presignedUrl;
  const totalRooms = rooms?.length ?? 0;

  const [propertyImageError, setPropertyImageError] = useState(false);

  const confirm = () => {
    router.replace('/(app)/(tabs)');
  };

  const sharingPrices = property
    ? [
        { label: '1 Sharing', value: property.sharing1 },
        { label: '2 Sharing', value: property.sharing2 },
        { label: '3 Sharing', value: property.sharing3 },
        { label: '4 Sharing', value: property.sharing4 },
        { label: '5 Sharing', value: property.sharing5 },
      ].filter((item) => typeof item.value === 'number' && item.value > 0)
    : [];

  return (
    <ScreenWrapper backgroundColor={theme.colors.primary}>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: theme.spacing.lg, width: 40 }}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
            </TouchableOpacity>

            <StepIndicator steps={STEPS} currentStep={2} style={{ marginBottom: theme.spacing.xl }} />

            <View>
              <Typography variant="headline2" color={theme.colors.white} align="center">
                Review Details
              </Typography>
              <Typography variant="body" color="rgba(255,255,255,0.8)" align="center" style={{ marginTop: theme.spacing.sm }}>
                Please check your complete details
              </Typography>
            </View>
          </View>

          {/* Content card */}
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderTopLeftRadius: theme.radius['2xl'],
              borderTopRightRadius: theme.radius['2xl'],
              paddingHorizontal: theme.spacing.base,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.xl,
              flex: 1,
            }}
          >
            {/* Owner Details */}
            <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>
              Owner Details
            </Typography>
            <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Avatar size={64} uri={ownerImageUrl || ''} name={user?.name} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                  <Typography variant="title1">{user?.name || 'Owner'}</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {user?.email || '-'}
                  </Typography>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
                  <Ionicons name="call-outline" size={16} color={theme.colors.primary} />
                  <Typography variant="bodyMedium" style={{ marginLeft: 8 }}>
                    {user?.mobile || '-'}
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Property Details */}
            <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>
              Property Details
            </Typography>
            <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
              {propertyLoading ? (
                <Typography variant="body" color={theme.colors.textMuted}>
                  Loading property details...
                </Typography>
              ) : property ? (
                <>
                  <View style={{ position: 'relative', marginBottom: theme.spacing.md }}>
                    <Image
                      source={{
                        uri: (!propertyImageError && propertyImageUrl) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                      }}
                      style={{ width: '100%', height: 160, borderRadius: theme.radius.lg }}
                      resizeMode="cover"
                      onError={() => setPropertyImageError(true)}
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
                      <Typography variant="caption" color={theme.colors.white}>
                        1/1
                      </Typography>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <Typography variant="title1">{property.name}</Typography>
                    <View
                      style={{
                        backgroundColor: theme.colors.primarySurface,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.xs,
                        borderRadius: theme.radius.full,
                      }}
                    >
                      <Typography variant="caption" color={theme.colors.primary}>
                        {PG_TYPE_LABEL[property.pgType] || property.pgType}
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {property.address}
                    {property.city ? `, ${property.city}` : ''}
                  </Typography>

                  <View style={{ flexDirection: 'row', marginTop: theme.spacing.md }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="business-outline" size={18} color={theme.colors.primary} />
                      <View style={{ marginLeft: theme.spacing.sm }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          Total Floors
                        </Typography>
                        <Typography variant="bodyMedium">{property.numberOfFloors ?? '-'}</Typography>
                      </View>
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="grid-outline" size={18} color={theme.colors.primary} />
                      <View style={{ marginLeft: theme.spacing.sm }}>
                        <Typography variant="caption" color={theme.colors.textMuted}>
                          Total Rooms
                        </Typography>
                        <Typography variant="bodyMedium">{totalRooms}</Typography>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/screens/property-details', params: { id: property.id } })}
                    style={{ alignSelf: 'flex-end', marginTop: theme.spacing.md }}
                  >
                    <Typography variant="bodyMedium" color={theme.colors.primary}>
                      View Details
                    </Typography>
                  </TouchableOpacity>
                </>
              ) : (
                <Typography variant="body" color={theme.colors.textMuted}>
                  No property data available.
                </Typography>
              )}
            </Card>

            {/* Room Types */}
            <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>
              Room Types
            </Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
              {sharingPrices.length > 0 ? (
                sharingPrices.map((item) => (
                  <View
                    key={item.label}
                    style={{
                      backgroundColor: theme.colors.primarySurface,
                      borderRadius: theme.radius.lg,
                      paddingVertical: theme.spacing.md,
                      paddingHorizontal: theme.spacing.lg,
                      minWidth: 100,
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="bodyMedium" color={theme.colors.primary}>
                      {item.label}
                    </Typography>
                    <Typography variant="caption" color={theme.colors.primary} style={{ marginTop: theme.spacing.xs }}>
                      ₹ {item.value}/m
                    </Typography>
                  </View>
                ))
              ) : (
                <Typography variant="caption" color={theme.colors.textMuted}>
                  No room types added.
                </Typography>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Bottom action */}
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
