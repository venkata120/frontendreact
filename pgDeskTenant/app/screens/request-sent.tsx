import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function RequestSentScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.base }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.primarySurface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          <Ionicons name="paper-plane" size={50} color={theme.colors.primary} />
        </View>
        <Typography variant="headline2" align="center">Request Sent !</Typography>
        <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing['3xl'] }}>
          Your request has been sent to the owner. You will be notified once it is approved.
        </Typography>
        <Button title="Done" onPress={() => router.replace('/(app)/(tabs)')} />
      </View>
    </ScreenWrapper>
  );
}
