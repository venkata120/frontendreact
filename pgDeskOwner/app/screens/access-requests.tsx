import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const REQUESTS = [
  {
    name: 'Manager Venkat.K',
    description: 'is requesting access to view tenant contact numbers.',
    avatar: 'https://i.pravatar.cc/150?u=venkat',
    date: 'Today, 10:30 AM',
  },
  {
    name: 'Manager Ravi.S',
    description: 'is requesting access to collect rent payments.',
    avatar: 'https://i.pravatar.cc/150?u=ravi',
    date: 'Yesterday, 4:15 PM',
  },
];

export default function AccessRequestsScreen() {
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          {REQUESTS.map((request, index) => (
            <Card key={index} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Avatar uri={request.avatar} name={request.name} size={48} />
                <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                  <Typography variant="body">
                    <Typography variant="bodyMedium">{request.name}</Typography> {request.description}
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 2 }}>{request.date}</Typography>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.white,
                    borderWidth: 1,
                    borderColor: theme.colors.primary,
                    marginRight: 4,
                  }}
                >
                  <Ionicons name="close-circle" size={16} color={theme.colors.primary} />
                  <Typography variant="bodyMedium" color={theme.colors.primary} style={{ marginLeft: 6, fontWeight: '600' }}>Reject</Typography>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 10,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.success,
                    marginLeft: 4,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.white} />
                  <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>Approve</Typography>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
