import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';

const FAQS = [
  { question: 'How do I pay my dues?', answer: 'Go to My Dues and tap Pay Pending Dues.' },
  { question: 'How to raise a complaint?', answer: 'Use the Complaints option from the menu.' },
  { question: 'Can I view my payment history?', answer: 'Yes, all paid dues are listed in My Dues.' },
  { question: 'How to update my profile?', answer: 'Go to Profile and tap Edit Profile.' },
];

export default function SupportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header image with overlay */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.22)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              right: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar size={44} uri="https://i.pravatar.cc/150?u=tenant" name={user?.name || 'Srinivas'} />
              <View style={{ marginLeft: theme.spacing.sm }}>
                <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>
                  {user?.name || 'Srinivas'}
                </Typography>
                <Typography variant="caption" color={theme.colors.white}>
                  Student
                </Typography>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FACC15',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications" size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              flexDirection: 'row',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: theme.spacing.lg }}>
              <Typography variant="bodyMedium" color={theme.colors.white}>Floor - </Typography>
              <Typography variant="title2" color={theme.colors.white}>1</Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="bodyMedium" color={theme.colors.white}>Room - </Typography>
              <Typography variant="title2" color={theme.colors.white}>102</Typography>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base }}>
          {/* Chatbot card */}
          <TouchableOpacity activeOpacity={0.9}>
            <Card
              shadow="md"
              padding={theme.spacing.md}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.primary,
                marginBottom: theme.spacing.lg,
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: '#F0F7FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: theme.spacing.md,
                }}
              >
                <Ionicons name="logo-android" size={32} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="title2">How can we help you ?</Typography>
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: 2 }}>
                  Here is the Chatbot to help You
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </Card>
          </TouchableOpacity>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>
            FAQs
          </Typography>

          {FAQS.map((faq, index) => (
            <Card key={index} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <Typography variant="title3">{faq.question}</Typography>
              <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.xs }}>
                {faq.answer}
              </Typography>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
