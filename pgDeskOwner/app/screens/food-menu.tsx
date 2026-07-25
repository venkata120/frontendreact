import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenWrapper,
  Header,
  Typography,
  Card,
  SearchBar,
  Input,
  Button,
  PgSelector,
  DaySelector,
  getRepeatLabel,
} from '../../src/components';
import { DatePicker } from '../../src/components/DatePicker/DatePicker';
import { useTheme } from '../../src/hooks/useTheme';

import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useFoodMenusByProperty, useCreateFoodMenu, useUpdateFoodMenu, useDeleteFoodMenu } from '../../src/hooks/queries';
import dayjs from 'dayjs';
import type { FoodMenu, FoodMenuItem, MealType, MenuType, RepeatType, SpecialAction, FoodType } from '../../src/types';

const MEAL_OPTIONS: { label: string; value: MealType; icon: keyof typeof Ionicons.glyphMap; color: string; time: string }[] = [
  { label: 'Breakfast', value: 'BREAKFAST', icon: 'sunny-outline', color: '#F97316', time: '8:00 AM-10:00 AM' },
  { label: 'Lunch', value: 'LUNCH', icon: 'sunny', color: '#A855F7', time: '1:00 PM-3:00 PM' },
  { label: 'Dinner', value: 'DINNER', icon: 'moon', color: '#F59E0B', time: '8:00 PM-10:00 PM' },
];

const MENU_TYPE_OPTIONS: { label: string; value: MenuType }[] = [
  { label: 'Regular', value: 'REGULAR' },
  { label: 'Special', value: 'SPECIAL' },
];

const REPEAT_OPTIONS: { label: string; value: RepeatType }[] = [
  { label: 'Everyday', value: 'EVERYDAY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Custom', value: 'CUSTOM' },
];

const SPECIAL_ACTION_OPTIONS: { label: string; value: SpecialAction }[] = [
  { label: 'Replace', value: 'REPLACE' },
  { label: 'Add-on', value: 'ADD_ON' },
];

const FOOD_TYPE_OPTIONS: { label: string; value: FoodType; color: string }[] = [
  { label: 'Veg', value: 'VEG', color: '#22C55E' },
  { label: 'Non-Veg', value: 'NON_VEG', color: '#EF4444' },
  { label: 'Egg', value: 'EGG', color: '#F59E0B' },
];

const EMPTY_ITEM = (): FoodMenuItem => ({
  itemName: '',
  description: '',
  foodType: 'VEG',
});

const EMPTY_MENU = (propertyId: string): FoodMenu => ({
  propertyId,
  menuName: '',
  mealType: 'BREAKFAST',
  menuType: 'REGULAR',
  menuDate: dayjs().format('YYYY-MM-DD'),
  repeatType: 'EVERYDAY',
  repeatDays: [1, 2, 3, 4, 5, 6, 7],
  items: [EMPTY_ITEM()],
});

export default function FoodMenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ editMenuId?: string }>();
  const { selectedPg } = useSelectedPg();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<FoodMenu | null>(null);
  const [form, setForm] = useState<FoodMenu>(() => EMPTY_MENU(selectedPg?.id || ''));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const propertyId = selectedPg?.id || null;
  const { data: menus = [], isLoading, refetch } = useFoodMenusByProperty(propertyId);
  const createMenu = useCreateFoodMenu();
  const updateMenu = useUpdateFoodMenu();
  const deleteMenu = useDeleteFoodMenu();

  useFocusEffect(
    useCallback(() => {
      if (propertyId) refetch();
    }, [propertyId, refetch])
  );

  useEffect(() => {
    if (selectedPg?.id && !menuModalVisible) {
      setForm((prev) => ({ ...prev, propertyId: selectedPg.id }));
    }
  }, [selectedPg, menuModalVisible]);

  const filteredMenus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter(
      (m) =>
        m.menuName.toLowerCase().includes(q) ||
        m.mealType.toLowerCase().includes(q) ||
        m.items.some((i) => i.itemName.toLowerCase().includes(q))
    );
  }, [menus, searchQuery]);

  const groupedMenus = useMemo(() => {
    const groups: Record<string, FoodMenu[]> = {};
    filteredMenus.forEach((menu) => {
      const date = menu.menuDate || 'No Date';
      if (!groups[date]) groups[date] = [];
      groups[date].push(menu);
    });
    return Object.entries(groups).sort(([a], [b]) => (a > b ? 1 : -1));
  }, [filteredMenus]);

  const mealCounts = useMemo(() => {
    const counts: Record<MealType, number> = { BREAKFAST: 0, LUNCH: 0, DINNER: 0 };
    menus.forEach((m) => {
      counts[m.mealType] = (counts[m.mealType] || 0) + m.items.length;
    });
    return counts;
  }, [menus]);

  const openAddMenu = (mealType?: MealType, date?: string) => {
    if (!propertyId) {
      Alert.alert('Select Property', 'Please select a PG property first.');
      return;
    }
    setEditingMenu(null);
    setForm({
      ...EMPTY_MENU(propertyId),
      mealType: mealType || 'BREAKFAST',
      menuDate: date || dayjs().format('YYYY-MM-DD'),
    });
    setErrors({});
    setMenuModalVisible(true);
  };

  const openEditMenu = (menu: FoodMenu) => {
    setEditingMenu(menu);
    setForm({
      ...menu,
      propertyId: menu.propertyId || propertyId || '',
      menuDate: menu.menuDate || dayjs().format('YYYY-MM-DD'),
      repeatDays: menu.repeatDays || (menu.repeatType === 'EVERYDAY' ? [1, 2, 3, 4, 5, 6, 7] : []),
      items: menu.items.length ? menu.items.map((i) => ({ ...i })) : [EMPTY_ITEM()],
    });
    setErrors({});
    setMenuModalVisible(true);
  };

  useEffect(() => {
    if (!params.editMenuId || !menus.length || menuModalVisible) return;
    const menuToEdit = menus.find((m) => m.id === params.editMenuId);
    if (menuToEdit) {
      setEditingMenu(menuToEdit);
      setForm({
        ...menuToEdit,
        propertyId: menuToEdit.propertyId || propertyId || '',
        menuDate: menuToEdit.menuDate || dayjs().format('YYYY-MM-DD'),
        repeatDays: menuToEdit.repeatDays || (menuToEdit.repeatType === 'EVERYDAY' ? [1, 2, 3, 4, 5, 6, 7] : []),
        items: menuToEdit.items.length ? menuToEdit.items.map((i) => ({ ...i })) : [EMPTY_ITEM()],
      });
      setErrors({});
      setMenuModalVisible(true);
      router.setParams({ editMenuId: undefined });
    }
  }, [params.editMenuId, menus, menuModalVisible, propertyId, router]);

  const closeMenuModal = () => {
    setMenuModalVisible(false);
    setEditingMenu(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.menuName.trim()) next.menuName = 'Menu name is required';
    if (!form.mealType) next.mealType = 'Meal type is required';
    if (!form.menuType) next.menuType = 'Menu type is required';
    if (!form.repeatType) next.repeatType = 'Repeat type is required';
    if (!form.menuDate) next.menuDate = 'Menu date is required';
    if (form.menuType === 'SPECIAL' && !form.specialAction) {
      next.specialAction = 'Special action is required';
    }
    if ((form.repeatType === 'WEEKLY' || form.repeatType === 'CUSTOM') && (!form.repeatDays || form.repeatDays.length === 0)) {
      next.repeatDays = 'Select at least one day';
    }
    if (!form.items.length) next.items = 'Add at least one item';
    form.items.forEach((item, idx) => {
      if (!item.itemName.trim()) next[`item_${idx}_name`] = 'Item name is required';
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload: FoodMenu = {
        ...form,
        repeatDays:
          form.repeatType === 'EVERYDAY'
            ? [1, 2, 3, 4, 5, 6, 7]
            : form.repeatDays && form.repeatDays.length > 0
            ? form.repeatDays
            : undefined,
        items: form.items.map((item, idx) => ({
          ...item,
          displayOrder: item.displayOrder || idx + 1,
        })),
      };
      if (editingMenu?.id) {
        await updateMenu.mutateAsync({ menuId: editingMenu.id, payload });
      } else {
        await createMenu.mutateAsync(payload);
      }
      closeMenuModal();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to save menu');
    }
  };

  const handleDelete = (menu: FoodMenu) => {
    Alert.alert('Delete Menu', `Are you sure you want to delete "${menu.menuName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (!menu.id || !propertyId) return;
            await deleteMenu.mutateAsync({ menuId: menu.id, propertyId });
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to delete menu');
          }
        },
      },
    ]);
  };

  const updateField = useCallback(<K extends keyof FoodMenu>(field: K, value: FoodMenu[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  const handleRepeatTypeChange = (value: RepeatType) => {
    let days = form.repeatDays || [];
    if (value === 'EVERYDAY') days = [1, 2, 3, 4, 5, 6, 7];
    else if (value === 'WEEKLY' && days.length === 0) days = [2, 3, 4, 5, 6];
    else if (value === 'CUSTOM' && days.length === 0) days = [];
    updateField('repeatType', value);
    updateField('repeatDays', days);
  };

  // Ensure mandatory menu date is present when a SPECIAL menu is selected
  useEffect(() => {
    if (form.menuType === 'SPECIAL' && !form.menuDate) {
      updateField('menuDate', dayjs().format('YYYY-MM-DD'));
    }
  }, [form.menuType, form.menuDate, updateField]);

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, EMPTY_ITEM()] }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const updateItem = (index: number, field: keyof FoodMenuItem, value: any) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
    if (errors[`item_${index}_name`]) {
      setErrors((prev) => ({ ...prev, [`item_${index}_name`]: '' }));
    }
  };

  const renderOptionButton = <T extends string>(
    options: { label: string; value: T }[],
    selected: T,
    onSelect: (value: T) => void
  ) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.spacing.sm }}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => onSelect(opt.value)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.full,
              backgroundColor: active ? theme.colors.primary : theme.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: active ? theme.colors.primary : theme.colors.border,
            }}
          >
            <Typography variant="caption" color={active ? theme.colors.white : theme.colors.text}>
              {opt.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderMenuCard = (menu: FoodMenu) => {
    const mealMeta = MEAL_OPTIONS.find((m) => m.value === menu.mealType);
    const repeatText = getRepeatLabel(menu.repeatDays);
    return (
      <Card key={menu.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={mealMeta?.icon || 'restaurant-outline'} size={18} color={mealMeta?.color || theme.colors.primary} />
              <Typography variant="title3" color={theme.colors.text} style={{ fontWeight: '600', marginLeft: theme.spacing.sm }}>
                {menu.menuName}
              </Typography>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs, flexWrap: 'wrap' }}>
              <Typography variant="caption" color={theme.colors.textMuted} style={{ textTransform: 'capitalize' }}>
                {menu.mealType.toLowerCase()}
              </Typography>
              {menu.menuType === 'SPECIAL' && menu.specialAction ? (
                <View style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.warningSurface, borderRadius: theme.radius.full, paddingHorizontal: 8, paddingVertical: 2, marginLeft: theme.spacing.sm }}>
                  <Typography variant="caption" color={theme.colors.warning} style={{ fontWeight: '600' }}>
                    SPECIAL
                  </Typography>
                </View>
              ) : null}
              {repeatText ? (
                <View style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.primarySurface, borderRadius: theme.radius.full, paddingHorizontal: 8, paddingVertical: 2, marginLeft: theme.spacing.sm }}>
                  <Typography variant="caption" color={theme.colors.primary} style={{ fontWeight: '600' }}>
                    {repeatText}
                  </Typography>
                </View>
              ) : null}
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => openEditMenu(menu)} style={{ marginRight: theme.spacing.sm }}>
              <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(menu)}>
              <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: theme.spacing.md }}>
          {menu.items.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    item.foodType === 'NON_VEG' ? '#EF4444' : item.foodType === 'EGG' ? '#F59E0B' : '#22C55E',
                  marginRight: theme.spacing.sm,
                }}
              />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" color={theme.colors.text}>
                  {item.itemName}
                </Typography>
                {item.description ? (
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {item.description}
                  </Typography>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <Header
        title="Food Menu"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
        rightAction={<PgSelector />}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search Menu..." value={searchQuery} onChangeText={setSearchQuery} />
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: theme.spacing.md }}>
            {MEAL_OPTIONS.map((meal) => (
              <Card key={meal.value} shadow="sm" padding={theme.spacing.md} style={{ width: 120, marginRight: theme.spacing.md }}>
                <Typography variant="title2" color={meal.color}>
                  {mealCounts[meal.value]} Items
                </Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  {meal.label}
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
                  <Ionicons name="time-outline" size={12} color={theme.colors.textMuted} />
                  <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>
                    {meal.time.split('-')[0]}
                  </Typography>
                </View>
              </Card>
            ))}
          </ScrollView>

          {!propertyId ? (
            <Card shadow="sm" padding={theme.spacing.lg} style={{ alignItems: 'center' }}>
              <Ionicons name="restaurant-outline" size={40} color={theme.colors.textMuted} />
              <Typography variant="bodyMedium" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}>
                Select a property to view and manage food menus.
              </Typography>
            </Card>
          ) : isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
          ) : filteredMenus.length === 0 ? (
            <Card shadow="sm" padding={theme.spacing.lg} style={{ alignItems: 'center' }}>
              <Ionicons name="fast-food-outline" size={40} color={theme.colors.textMuted} />
              <Typography variant="bodyMedium" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}>
                {searchQuery ? 'No menus match your search.' : 'No food menus added yet.'}
              </Typography>
            </Card>
          ) : (
            groupedMenus.map(([date, dateMenus]) => {
              const dateLabel = date === 'No Date' ? 'No Date' : dayjs(date).format('dddd (DD-MM-YYYY)');
              return (
                <View key={date} style={{ marginBottom: theme.spacing.lg }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: theme.colors.primary,
                      borderRadius: theme.radius.lg,
                      paddingHorizontal: theme.spacing.md,
                      paddingVertical: theme.spacing.sm,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="calendar" size={18} color={theme.colors.white} />
                      <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: theme.spacing.sm, fontWeight: '600' }}>
                        {dateLabel}
                      </Typography>
                    </View>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => openAddMenu('BREAKFAST', date)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="repeat" size={16} color={theme.colors.white} />
                      <Typography variant="caption" color={theme.colors.white} style={{ marginLeft: 4, fontWeight: '600' }}>
                        Repeat Menu
                      </Typography>
                    </TouchableOpacity>
                  </View>

                  {MEAL_OPTIONS.map((meal) => {
                    const mealMenus = dateMenus.filter((m) => m.mealType === meal.value);
                    return (
                      <View key={meal.value} style={{ marginBottom: theme.spacing.md }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                          <Ionicons name={meal.icon} size={18} color={meal.color} />
                          <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginLeft: theme.spacing.sm, fontWeight: '600' }}>
                            {meal.label}
                          </Typography>
                          <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: theme.spacing.sm }}>
                            ({meal.time})
                          </Typography>
                        </View>
                        {mealMenus.length === 0 ? (
                          <Typography variant="caption" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.sm }}>
                            No {meal.label.toLowerCase()} menu added.
                          </Typography>
                        ) : (
                          mealMenus.map(renderMenuCard)
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openAddMenu()}
        style={{
          position: 'absolute',
          right: theme.spacing.base,
          bottom: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          ...theme.shadows.md,
        }}
      >
        <Ionicons name="add" size={22} color={theme.colors.white} />
        <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
          Add Menu
        </Typography>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        statusBarTranslucent
        visible={menuModalVisible}
        onRequestClose={closeMenuModal}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.black }}>
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              maxHeight: '92%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Typography variant="title3" color={theme.colors.text} style={{ fontWeight: '600' }}>
                {editingMenu ? 'Edit Menu' : 'Add Menu'}
              </Typography>
              <TouchableOpacity onPress={closeMenuModal}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ paddingBottom: theme.spacing.xl }}>
                <Input
                  label="Menu Name"
                  placeholder="e.g. South Indian Breakfast"
                  value={form.menuName}
                  onChangeText={(text) => updateField('menuName', text)}
                  error={errors.menuName}
                />

                <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginBottom: theme.spacing.xs }}>
                  Meal Type
                </Typography>
                {renderOptionButton(
                  MEAL_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
                  form.mealType,
                  (value) => updateField('mealType', value as MealType)
                )}
                {errors.mealType ? (
                  <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.xs }}>
                    {errors.mealType}
                  </Typography>
                ) : null}

                {form.menuType === 'SPECIAL' && (
                  <>
                    <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                      Menu Date
                    </Typography>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setDatePickerVisible(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.sm,
                        borderRadius: theme.radius.md,
                        borderWidth: 1,
                        borderColor: errors.menuDate ? theme.colors.danger : theme.colors.border,
                        backgroundColor: theme.colors.backgroundSecondary,
                      }}
                    >
                      <Ionicons name="calendar" size={18} color={theme.colors.primary} />
                      <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                        {form.menuDate ? dayjs(form.menuDate).format('dddd, DD MMM YYYY') : 'Select date'}
                      </Typography>
                      <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                    {errors.menuDate ? (
                      <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.xs }}>
                        {errors.menuDate}
                      </Typography>
                    ) : null}
                  </>
                )}

                <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                  Menu Type
                </Typography>
                {renderOptionButton(MENU_TYPE_OPTIONS, form.menuType, (value) => updateField('menuType', value as MenuType))}

                {form.menuType === 'SPECIAL' ? (
                  <>
                    <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                      Special Action
                    </Typography>
                    {renderOptionButton(SPECIAL_ACTION_OPTIONS, form.specialAction || 'REPLACE', (value) =>
                      updateField('specialAction', value as SpecialAction)
                    )}
                    {errors.specialAction ? (
                      <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.xs }}>
                        {errors.specialAction}
                      </Typography>
                    ) : null}
                  </>
                ) : null}

                <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                  Repeat Type
                </Typography>
                {renderOptionButton(REPEAT_OPTIONS, form.repeatType, (value) => handleRepeatTypeChange(value as RepeatType))}

                {form.repeatType === 'CUSTOM' && (
                  <>
                    <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                      Repeat Days
                    </Typography>
                    <DaySelector
                      selectedDays={form.repeatDays || []}
                      onChange={(days) => updateField('repeatDays', days)}
                    />
                    {errors.repeatDays ? (
                      <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.xs }}>
                        {errors.repeatDays}
                      </Typography>
                    ) : null}
                    {form.repeatDays && form.repeatDays.length > 0 ? (
                      <Typography variant="caption" color={theme.colors.primary} style={{ marginTop: theme.spacing.xs, fontWeight: '600' }}>
                        {getRepeatLabel(form.repeatDays)}
                      </Typography>
                    ) : null}
                  </>
                )}

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
                  <Typography variant="bodyMedium" color={theme.colors.text} style={{ fontWeight: '600' }}>
                    Menu Items
                  </Typography>
                  <TouchableOpacity onPress={addItem} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="add-circle" size={22} color={theme.colors.primary} />
                    <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4, fontWeight: '600' }}>
                      Add Item
                    </Typography>
                  </TouchableOpacity>
                </View>

                {errors.items ? (
                  <Typography variant="caption" color={theme.colors.danger} style={{ marginBottom: theme.spacing.sm }}>
                    {errors.items}
                  </Typography>
                ) : null}

                {form.items.map((item, index) => (
                  <Card key={index} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md, backgroundColor: theme.colors.backgroundSecondary }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ fontWeight: '600' }}>
                        Item {index + 1}
                      </Typography>
                      {form.items.length > 1 ? (
                        <TouchableOpacity onPress={() => removeItem(index)}>
                          <Ionicons name="close-circle" size={22} color={theme.colors.danger} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <Input
                      placeholder="Item name"
                      value={item.itemName}
                      onChangeText={(text) => updateItem(index, 'itemName', text)}
                      containerStyle={{ marginBottom: theme.spacing.sm }}
                      error={errors[`item_${index}_name`]}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={item.description || ''}
                      onChangeText={(text) => updateItem(index, 'description', text)}
                      containerStyle={{ marginBottom: theme.spacing.sm }}
                    />
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.xs }}>
                      Food Type
                    </Typography>
                    {renderOptionButton(
                      FOOD_TYPE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
                      item.foodType || 'VEG',
                      (value) => updateItem(index, 'foodType', value as FoodType)
                    )}
                  </Card>
                ))}

                <Button
                  title={editingMenu ? 'Update Menu' : 'Save Menu'}
                  onPress={handleSave}
                  loading={createMenu.isPending || updateMenu.isPending}
                  style={{ marginTop: theme.spacing.lg }}
                />
                <Button title="Cancel" variant="outline" onPress={closeMenuModal} style={{ marginTop: theme.spacing.sm }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DatePicker
        visible={datePickerVisible}
        value={form.menuDate}
        onChange={(date) => updateField('menuDate', dayjs(date).format('YYYY-MM-DD'))}
        onClose={() => setDatePickerVisible(false)}
        title="Select Menu Date"
      />
    </ScreenWrapper>
  );
}
