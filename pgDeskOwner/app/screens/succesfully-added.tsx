import { useRouter, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function SuccessfullyAddedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.base }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.successSurface,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: theme.spacing.lg,
          }}
        >
          <Ionicons name="checkmark" size={50} color={theme.colors.success} />
        </View>
        <Typography variant="headline2" align="center">Successfully Added !</Typography>
        <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing['3xl'] }}>
          Your property has been saved successfully.
        </Typography>
        {next === 'assign-manager' ? (
          <Button title="Assign Manager" onPress={() => router.replace('/screens/assign-manager')} />
        ) : (
          <Button title="Done" onPress={() => router.replace('/(app)/(tabs)')} />
        )}
      </View>
    </ScreenWrapper>
  );
}
