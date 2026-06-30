import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const FOOD_COLOR = '#E27305';

export default function FoodMessChargesScreen() {
  const theme = useTheme();
  const router = useRouter();

  // Food / Mess income is not yet tracked separately by the backend.
  const totalIncome = 0;
  const totalTransactions = 0;
  const avgPerTransaction = 0;
  const percentOfTotalIncome = 0;

  return (
    <ScreenWrapper>
      {/* Orange header */}
      <View
        style={{
          backgroundColor: FOOD_COLOR,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
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
          <Ionicons name="arrow-back" size={20} color={FOOD_COLOR} />
        </TouchableOpacity>
        <Typography variant="headline2" color={theme.colors.white}>
          Food/Mess Charges
        </Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          {/* Food icon circle */}
          <View style={{ alignItems: 'center', marginVertical: theme.spacing.lg }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: FOOD_COLOR,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 4,
                borderColor: theme.colors.white,
                shadowColor: theme.colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="restaurant" size={36} color={theme.colors.white} />
            </View>
          </View>

          {/* Total income card */}
          <Card shadow="md" padding={theme.spacing.lg} style={{ backgroundColor: theme.colors.white, marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  Total income
                </Typography>
                <Typography variant="headline1" color={FOOD_COLOR}>
                  ₹ {totalIncome.toLocaleString()}
                </Typography>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Typography variant="title1" color={FOOD_COLOR} style={{ fontWeight: '700' }}>
                  {percentOfTotalIncome}%
                </Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  of total income
                </Typography>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: theme.spacing.md,
                paddingTop: theme.spacing.md,
                borderTopWidth: 1,
                borderTopColor: theme.colors.borderLight,
              }}
            >
              <View>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  Total Transactions
                </Typography>
                <Typography variant="title2" style={{ fontWeight: '700' }}>
                  {totalTransactions}
                </Typography>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  Avg per Transaction
                </Typography>
                <Typography variant="title2" style={{ fontWeight: '700' }}>
                  ₹ {avgPerTransaction.toLocaleString()}
                </Typography>
              </View>
            </View>
          </Card>

          {/* Recent Transactions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <Typography variant="title1">Recent Transactions</Typography>
            <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '500' }}>
                view All
              </Typography>
              <Ionicons name="chevron-down" size={14} color={theme.colors.primary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.warningSurface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.lg,
              }}
            >
              <Ionicons name="restaurant-outline" size={48} color={theme.colors.textMuted} />
            </View>
            <Typography variant="title1">No Food / Mess Charges</Typography>
            <Typography variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', paddingHorizontal: theme.spacing.lg }}>
              Food and mess charges are not tracked separately yet. They will appear here once the backend supports them.
            </Typography>
          </View>

          <View style={{ height: 80 }} />
        </View>
      </ScrollView>

      {/* Add Income button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: theme.spacing.base,
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.borderLight,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/screens/add-payment' as any)}
          style={{
            backgroundColor: FOOD_COLOR,
            borderRadius: theme.radius.full,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={20} color={theme.colors.white} />
          <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
            Add Income
          </Typography>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
