import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';

const MEAL_SUMMARY = [
  { meal: 'Breakfast', items: 2, time: '8:00 AM', icon: 'sunny', color: '#F97316', bg: '#FFF1E6' },
  { meal: 'Lunch', items: 2, time: '1:00 PM', icon: 'sunny', color: '#A855F7', bg: '#F3E8FF' },
  { meal: 'Dinner', items: 2, time: '8:00 PM', icon: 'moon', color: '#F59E0B', bg: '#FEF3C7' },
];

const MENU_ITEMS = [
  {
    meal: 'Breakfast',
    time: '8:00 AM-10:00 AM',
    icon: '🌅',
    name: 'Aloo Paratha with Curd',
    desc: 'Stuffed potato flatbread with fresh curd and pickle',
  },
  {
    meal: 'Lunch',
    time: '01:00 PM-03:00 PM',
    icon: '☀️',
    name: 'Dal Rice with Seasonal Vegetables',
    desc: 'Yellow lentils, steamed rice, mixed vegetables, salad',
  },
  {
    meal: 'Dinner',
    time: '08:00PM-10:00PM',
    icon: '🌙',
    name: 'Paneer Butter Masala with Roti',
    desc: 'Rich cottage cheese curry with wheat flatbreads',
    special: true,
  },
];

export default function MenuScreen() {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.warning,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <Typography variant="headline2" color={theme.colors.white}>Food Menu</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search Menu..." />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginVertical: theme.spacing.md }}>
            {MEAL_SUMMARY.map((item) => (
              <Card key={item.meal} shadow="sm" padding={theme.spacing.md} style={{ width: 120, marginRight: theme.spacing.md }}>
                <Typography variant="title2" color={item.color}>{item.items} Items</Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>{item.meal}</Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                  <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>{item.time}</Typography>
                </View>
              </Card>
            ))}
          </ScrollView>

          <Card shadow="md" padding={theme.spacing.md} style={{ backgroundColor: '#A855F7', marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={18} color={theme.colors.white} />
              <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 8, fontWeight: '600' }}>
                Monday (18-05-2026)
              </Typography>
            </View>
          </Card>

          {MENU_ITEMS.map((item) => (
            <View key={item.meal} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <Typography variant="bodyMedium" style={{ fontSize: 16 }}>{item.icon} {item.meal}</Typography>
                <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: theme.spacing.sm }}>({item.time})</Typography>
                {item.special && (
                  <View style={{ backgroundColor: '#FACC15', borderRadius: theme.radius.full, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 'auto' }}>
                    <Typography variant="caption" color={theme.colors.white} style={{ fontWeight: '600' }}>SPECIAL</Typography>
                  </View>
                )}
              </View>
              <Card
                shadow="sm"
                padding={theme.spacing.md}
                style={{
                  backgroundColor: item.meal === 'Lunch' ? '#FEFCE8' : '#FFFBEB',
                  borderWidth: 1,
                  borderColor: item.meal === 'Lunch' ? '#FDE047' : '#FDE68A',
                }}
              >
                <Typography variant="title3" color={theme.colors.warning}>{item.name}</Typography>
                <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 2 }}>{item.desc}</Typography>
              </Card>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
