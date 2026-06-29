import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Button } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';

const DUES = [
  { month: 'June 2026', amount: 10000, status: 'Pending', dueDate: '05 Jun 2026' },
  { month: 'May 2026', amount: 10000, status: 'Paid', dueDate: '05 May 2026' },
  { month: 'April 2026', amount: 10000, status: 'Paid', dueDate: '05 Apr 2026' },
];

export default function DuesScreen() {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      {/* Orange header */}
      <View
        style={{
          backgroundColor: theme.colors.warning,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <Typography variant="headline2" color={theme.colors.white}>
          My Dues
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Typography variant="caption" color={theme.colors.textMuted}>Total Pending</Typography>
                <Typography variant="headline1" color={theme.colors.warning}>₹10,000</Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>Due by 05 Jun 2026</Typography>
              </View>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: theme.colors.warningSurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="warning-outline" size={24} color={theme.colors.warning} />
              </View>
            </View>
          </Card>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.lg }}>
            <Card shadow="sm" padding={theme.spacing.md} style={{ width: '48%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="cash-outline" size={20} color={theme.colors.warning} style={{ marginRight: 8 }} />
                <View>
                  <Typography variant="caption" color={theme.colors.textMuted}>Pending</Typography>
                  <Typography variant="title2" color={theme.colors.warning}>₹7,500</Typography>
                </View>
              </View>
            </Card>
            <Card shadow="sm" padding={theme.spacing.md} style={{ width: '48%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} style={{ marginRight: 8 }} />
                <View>
                  <Typography variant="caption" color={theme.colors.textMuted}>Paid</Typography>
                  <Typography variant="title2" color={theme.colors.success}>₹0</Typography>
                </View>
              </View>
            </Card>
          </View>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Dues History</Typography>
          {DUES.map((due) => (
            <Card key={due.month} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Typography variant="title3">{due.month}</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>Due: {due.dueDate}</Typography>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Typography variant="title2" color={due.status === 'Pending' ? theme.colors.warning : theme.colors.success}>
                    ₹{due.amount.toLocaleString()}
                  </Typography>
                  <Typography variant="captionMedium" color={due.status === 'Pending' ? theme.colors.warning : theme.colors.success}>
                    {due.status}
                  </Typography>
                </View>
              </View>
            </Card>
          ))}

          <Button title="Pay Pending Dues" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xl }} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
