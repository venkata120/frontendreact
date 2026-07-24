import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const FAQS = [
  { question: 'How do I add a new room?', answer: 'Go to Rooms tab and tap the Add Room button.' },
  { question: 'How to collect rent?', answer: 'Open tenant details and tap Received payments.' },
  { question: 'How do I add staff?', answer: 'Go to Staff tab and tap Add Staff.' },
  { question: 'How to send notices?', answer: 'Use the Notices section from the Home screen.' },
];

export default function HelpScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      {/* Blue header */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              marginRight: theme.spacing.md,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>
            Help & Support
          </Typography>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.md }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
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
