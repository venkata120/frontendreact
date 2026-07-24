import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function LeftTenantsProfileEmptyStateScreen() {
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    router.replace('/screens/left-tenants-profile' as any);
  }, [router]);

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.base }}>
        <Ionicons name="people-outline" size={64} color={theme.colors.textMuted} />
        <Typography variant="title1" style={{ marginTop: theme.spacing.lg }}>No Left Tenants</Typography>
        <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}>There are no left tenants to display.</Typography>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    </ScreenWrapper>
  );
}
