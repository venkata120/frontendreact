import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const SECTIONS = [
  {
    title: '1. Rent Payment',
    points: [
      'The Tenant must pay the monthly rent on or before the 5th day of every month.',
      'Delays in payment may attract penalties as per the discretion of the Management.',
    ],
  },
  {
    title: '2. Notice Period',
    content: `a. Minimum Notice Requirement: The Tenant is required to provide a minimum of thirty (30) days written notice prior to vacating the premises.\n\nb. Notice Given on or Before 5th: The notice period will be calculated from the date of submission. Rent is payable for the entire 30-day period.\n\nExample: If notice is submitted on the 3rd of the current month, it will be valid until the 2nd of the following month.\n\nc. Notice Given on or After 6th: The Tenant must serve the full 30-day notice period and pay rent on a pro-rata basis for the subsequent month.\n\nExample: If notice is submitted on the 7th, it will be valid until the 6th of the following month. The subsequent month's rent will be charged on a daily basis until the 6th.\n\nToken advance and rent are non-refundable in case of early cancellation.`,
  },
  {
    title: '3. Responsibility for Personal Belongings',
    points: [
      'Management is not liable for loss, theft, or damage to personal belongings, including but not limited to electronics, jewelry, and documents.',
      'Tenants are advised to keep valuables securely and maintain their own insurance if needed.',
    ],
  },
];

export default function TermsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.background,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          paddingHorizontal: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)')}
          style={{ marginRight: theme.spacing.md }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Typography variant="headline2">Terms & Conditions</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: theme.spacing.base }}>
        {SECTIONS.map((section, index) => (
          <View key={index} style={{ marginBottom: theme.spacing.lg }}>
            <Typography variant="title1" style={{ marginBottom: theme.spacing.sm }}>{section.title}</Typography>
            {section.points && section.points.map((point, pIndex) => (
              <Typography key={pIndex} variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>
                • {point}
              </Typography>
            ))}
            {section.content && (
              <Typography variant="body" color={theme.colors.textSecondary}>
                {section.content}
              </Typography>
            )}
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}
