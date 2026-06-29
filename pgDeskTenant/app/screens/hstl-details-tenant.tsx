import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const ROOM_TYPES = [
  { label: '1 Sharing', rent: '12500/m' },
  { label: '2 Sharing', rent: '10500/m' },
  { label: '3 Sharing', rent: '8500/m' },
];

const FACILITIES = [
  'wifi', 'leaf', 'tv', 'business', 'water', 'thermometer', 'book', 'shield-checkmark', 'flashlight', 'videocam',
];

export default function HstlDetailsTenantScreen() {
  const theme = useTheme();
  const router = useRouter();

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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.white,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#0A2A5E" />
        </TouchableOpacity>
        <Typography variant="headline2" color={theme.colors.white}>Hostel Details</Typography>
        <Typography variant="caption" color={theme.colors.white} style={{ opacity: 0.8 }}>Enter Hostel code or scan the QR code provided by the hostel</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ position: 'relative', marginBottom: theme.spacing.md }}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
                style={{ width: '100%', height: 160, borderRadius: theme.radius.lg }}
                resizeMode="cover"
              />
              <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: theme.radius.full, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Typography variant="caption" color={theme.colors.white}>1/3</Typography>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
              <Typography variant="title1">Srinivas Rao mens pg</Typography>
              <Typography variant="bodyMedium" color={theme.colors.primary}>Boys</Typography>
            </View>
            <Typography variant="caption" color={theme.colors.textMuted}>Road no.5, vijay nagar colony, miyapur, hyderabad</Typography>
          </Card>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Room Types</Typography>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
            {ROOM_TYPES.map((type) => (
              <Card key={type.label} shadow="sm" padding={theme.spacing.md} style={{ width: '31%', alignItems: 'center' }}>
                <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '600' }}>{type.label}</Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>₹ {type.rent}</Typography>
              </Card>
            ))}
          </View>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Advance Amount</Typography>
          <Typography variant="bodyMedium" color={theme.colors.primary} style={{ marginBottom: theme.spacing.lg }}>₹3000 @all sharings</Typography>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Facilities</Typography>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.lg }}>
            {FACILITIES.map((facility) => (
              <View
                key={facility}
                style={{
                  width: '18%',
                  aspectRatio: 1,
                  backgroundColor: theme.colors.primarySurface,
                  borderRadius: theme.radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '2.5%',
                  marginBottom: theme.spacing.sm,
                }}
              >
                <Ionicons name={facility as any} size={24} color={theme.colors.primary} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base, borderTopWidth: 1, borderTopColor: theme.colors.borderLight }}>
        <Button
          title="Send Request to Owner"
          onPress={() => router.push('/(app)/screens/request-sent' as any)}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.sm }}>
          <Ionicons name="information-circle-outline" size={14} color={theme.colors.textMuted} />
          <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>The owner will verify your details and assign you a room</Typography>
        </View>
      </View>
    </ScreenWrapper>
  );
}
