import { useRouter } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { ScreenWrapper, Header, Typography, Card, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function PendingDuesScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <Header title="Pending Dues" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg, backgroundColor: theme.colors.warning }}>
            <Typography variant="caption" color={theme.colors.white}>Total Pending</Typography>
            <Typography variant="headline1" color={theme.colors.white}>₹7,500</Typography>
            <Typography variant="body" color={theme.colors.white}>Due by 05 Jun 2026</Typography>
          </Card>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Breakdown</Typography>
          {[
            { label: 'June Rent', amount: 10000 },
            { label: 'Maintenance', amount: 1000 },
            { label: 'Late Fee', amount: 0 },
          ].map((item) => (
            <Card key={item.label} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Typography variant="bodyMedium">{item.label}</Typography>
                <Typography variant="bodyMedium">₹{item.amount.toLocaleString()}</Typography>
              </View>
            </Card>
          ))}

          <Button title="Pay Now" />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
