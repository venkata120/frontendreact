import { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useTenant } from '../../../src/context/TenantContext';
import { useDailyFoodMenu } from '../../../src/hooks/queries/useFoodMenus';
import { formatDate } from '../../../src/utils/formatters';
import type { DailyMenu, MealType, FoodType } from '../../../src/types';

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

const MEAL_META: Record<MealType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  BREAKFAST: { icon: 'sunny-outline', color: '#F97316', bg: '#FFF1E6', label: 'Breakfast' },
  LUNCH: { icon: 'sunny', color: '#A855F7', bg: '#F3E8FF', label: 'Lunch' },
  DINNER: { icon: 'moon', color: '#F59E0B', bg: '#FEF3C7', label: 'Dinner' },
  SNACKS: { icon: 'cafe-outline', color: '#22C55E', bg: '#DCFCE7', label: 'Snacks' },
};

const FOOD_TYPE_OPTIONS: { label: string; value: FoodType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Veg', value: 'VEG' },
  { label: 'Non-Veg', value: 'NON_VEG' },
  { label: 'Egg', value: 'EGG' },
];

export default function MenuScreen() {
  const theme = useTheme();
  const { propertyId } = useTenant();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { data: dailyMenu, isLoading } = useDailyFoodMenu(propertyId ?? undefined, today);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [mealFilter, setMealFilter] = useState<MealType | 'ALL'>('ALL');
  const [foodTypeFilter, setFoodTypeFilter] = useState<FoodType | 'ALL'>('ALL');

  const filteredMenu = useMemo(() => {
    if (!dailyMenu) return [];
    const q = search.trim().toLowerCase();
    return dailyMenu.filter((item) => {
      const matchesMeal = mealFilter === 'ALL' || item.mealType === mealFilter;
      const matchesType = foodTypeFilter === 'ALL' || item.items.some((i) => i.foodType === foodTypeFilter);
      const matchesSearch =
        !q ||
        item.items.some((i) => i.itemName.toLowerCase().includes(q));
      return matchesMeal && matchesType && matchesSearch;
    });
  }, [dailyMenu, search, mealFilter, foodTypeFilter]);

  const menuByMeal = useMemo(() => {
    const map = new Map<MealType, DailyMenu[]>();
    filteredMenu.forEach((item) => {
      const list = map.get(item.mealType) || [];
      list.push(item);
      map.set(item.mealType, list);
    });
    return map;
  }, [filteredMenu]);

  const totalItems = useMemo(() => filteredMenu.reduce((sum, item) => sum + item.items.length, 0), [filteredMenu]);

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

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: theme.spacing.md }}>
        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search Menu..." value={search} onChangeText={setSearch} />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFilterOpen(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: mealFilter !== 'ALL' || foodTypeFilter !== 'ALL' ? theme.colors.warningSurface : theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: mealFilter !== 'ALL' || foodTypeFilter !== 'ALL' ? theme.colors.warning : theme.colors.border,
              }}
            >
              <Ionicons name="options-outline" size={22} color={mealFilter !== 'ALL' || foodTypeFilter !== 'ALL' ? theme.colors.warning : theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginVertical: theme.spacing.md }}>
            {MEAL_ORDER.map((meal) => {
              const meta = MEAL_META[meal];
              const items = menuByMeal.get(meal) || [];
              return (
                <Card key={meal} shadow="sm" padding={theme.spacing.md} style={{ width: 120, marginRight: theme.spacing.md }}>
                  <Typography variant="title2" color={meta.color}>{items.reduce((sum, i) => sum + i.items.length, 0)} Items</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>{meta.label}</Typography>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>Today</Typography>
                  </View>
                </Card>
              );
            })}
          </ScrollView>

          <Card shadow="md" padding={theme.spacing.md} style={{ backgroundColor: '#A855F7', marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={18} color={theme.colors.white} />
              <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 8, fontWeight: '600' }}>
                Today ({formatDate(today)}) — {totalItems} item{totalItems === 1 ? '' : 's'}
              </Typography>
            </View>
          </Card>

          {isLoading ? (
            <ActivityIndicator />
          ) : MEAL_ORDER.every((m) => !(menuByMeal.get(m)?.length)) ? (
            <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginVertical: theme.spacing.lg }}>
              No menu items match your search
            </Typography>
          ) : (
            MEAL_ORDER.map((meal) => {
              const meta = MEAL_META[meal];
              const items = menuByMeal.get(meal) || [];
              if (items.length === 0) return null;
              return (
                <View key={meal} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} style={{ marginRight: 8 }} />
                    <Typography variant="bodyMedium" style={{ fontSize: 16 }}>{meta.label}</Typography>
                    {items.some((i) => i.specialMenu) && (
                      <View style={{ backgroundColor: '#FACC15', borderRadius: theme.radius.full, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 'auto' }}>
                        <Typography variant="caption" color={theme.colors.white} style={{ fontWeight: '600' }}>SPECIAL</Typography>
                      </View>
                    )}
                  </View>
                  {items.map((item, idx) => (
                    <Card
                      key={idx}
                      shadow="sm"
                      padding={theme.spacing.md}
                      style={{
                        backgroundColor: meta.bg,
                        borderWidth: 1,
                        borderColor: meta.color,
                        marginBottom: theme.spacing.sm,
                      }}
                    >
                      {item.items.map((food, fIdx) => (
                        <View key={fIdx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: fIdx < item.items.length - 1 ? theme.spacing.sm : 0 }}>
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor:
                                food.foodType === 'NON_VEG' ? '#EF4444' : food.foodType === 'EGG' ? '#F59E0B' : '#22C55E',
                              marginRight: theme.spacing.sm,
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <Typography variant="bodyMedium" color={theme.colors.text}>{food.itemName}</Typography>
                            {food.description && (
                              <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 2 }}>{food.description}</Typography>
                            )}
                          </View>
                        </View>
                      ))}
                    </Card>
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={filterOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setFilterOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Typography variant="title2" style={{ fontWeight: '600' }}>Filter Menu</Typography>
              <TouchableOpacity onPress={() => setFilterOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Typography variant="bodyMedium" style={{ fontWeight: '600', marginBottom: theme.spacing.sm }}>Meal</Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md }}>
              {(['ALL', ...MEAL_ORDER] as (MealType | 'ALL')[]).map((meal) => {
                const selected = mealFilter === meal;
                return (
                  <TouchableOpacity
                    key={meal}
                    activeOpacity={0.8}
                    onPress={() => setMealFilter(meal)}
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.radius.full,
                      backgroundColor: selected ? theme.colors.warning : theme.colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: selected ? theme.colors.warning : theme.colors.border,
                    }}
                  >
                    <Typography variant="caption" color={selected ? theme.colors.white : theme.colors.text}>
                      {meal === 'ALL' ? 'All Meals' : MEAL_META[meal].label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Typography variant="bodyMedium" style={{ fontWeight: '600', marginBottom: theme.spacing.sm }}>Food Type</Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md }}>
              {FOOD_TYPE_OPTIONS.map((option) => {
                const selected = foodTypeFilter === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.8}
                    onPress={() => setFoodTypeFilter(option.value)}
                    style={{
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      borderRadius: theme.radius.full,
                      backgroundColor: selected ? theme.colors.primary : theme.colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: selected ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    <Typography variant="caption" color={selected ? theme.colors.white : theme.colors.text}>
                      {option.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setMealFilter('ALL');
                setFoodTypeFilter('ALL');
                setFilterOpen(false);
              }}
              style={{
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.md,
                paddingVertical: theme.spacing.md,
                alignItems: 'center',
              }}
            >
              <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>Reset Filters</Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
