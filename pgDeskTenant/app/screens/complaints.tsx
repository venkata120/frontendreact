import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const COMPLAINTS = [
  { title: 'Add Gym Equipment (Room 105)', postedBy: 'You (Room 201)', description: 'Many residents would like to have some basic gym equipment like dumbbells and yoga mats.', date: '11-05-2026', status: 'Resolved' },
  { title: 'WiFi Speed Issue', postedBy: 'You (Room 201)', description: 'The WiFi speed has been very slow for the past week. Please check with the ISP.', date: '11-05-2026', status: 'Resolved' },
  { title: 'Payment Receipt', postedBy: 'You (Room 201)', description: 'Need help with payment receipt. Not showing in app', date: '10-05-2026', status: 'Resolved' },
  { title: 'Electricity Issue', postedBy: 'You (Room 201)', description: 'My room is experiencing a power cut/low voltage. Other rooms have power. Please check and resolve at the earliest.', date: '09-05-2026', status: 'Resolved' },
];

export default function ComplaintsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
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
          <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <Typography variant="headline2" color={theme.colors.white}>Complaints</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search notices..." />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {COMPLAINTS.map((complaint, index) => (
            <Card key={index} shadow="sm" padding={theme.spacing.md} style={{ marginTop: theme.spacing.md, backgroundColor: '#FAF5FF', borderWidth: 1, borderColor: '#E9D5FF' }}>
              <Typography variant="title2" color={theme.colors.secondary}>{complaint.title}</Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: theme.spacing.sm }}>
                <Ionicons name="person-outline" size={14} color={theme.colors.primary} />
                <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4 }}>Posted by: {complaint.postedBy}</Typography>
              </View>
              <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>{complaint.description}</Typography>
              <Typography variant="caption" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.sm }}>Posted: {complaint.date}</Typography>
              <View style={{ alignSelf: 'flex-end', backgroundColor: theme.colors.success, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
                <Typography variant="caption" color={theme.colors.white} style={{ fontWeight: '600' }}>{complaint.status}</Typography>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          position: 'absolute',
          right: theme.spacing.base,
          bottom: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          ...theme.shadows.md,
        }}
      >
        <Ionicons name="add" size={22} color={theme.colors.white} />
        <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>Post Notice</Typography>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
