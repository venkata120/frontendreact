import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, HeroHeader } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useDashboardOverview, useNotices, useFoodMenusByProperty } from '../../../src/hooks/queries';
import type { FoodMenu } from '../../../src/types';

export default function ManagerHomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();

  const currentMonth = useMemo(() => String(new Date().getMonth() + 1).padStart(2, '0'), []);
  const currentYear = useMemo(() => String(new Date().getFullYear()), []);

  const managerId = user?.id;
  const overviewParams = useMemo(
    () => ({ month: currentMonth, year: currentYear, managerId, userId: managerId }),
    [currentMonth, currentYear, managerId]
  );
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useDashboardOverview(overviewParams);

  const noticeParams = useMemo(
    () => (selectedPg?.id ? { propertyId: selectedPg.id } : undefined),
    [selectedPg?.id]
  );
  const { data: notices, isLoading: noticesLoading, refetch: refetchNotices } = useNotices(noticeParams);

  const { data: foodMenus, isLoading: foodMenusLoading, refetch: refetchFoodMenus } = useFoodMenusByProperty(selectedPg?.id);

  const [activeTab, setActiveTab] = useState<'notices' | 'food'>('notices');
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      refetchOverview();
      if (selectedPg?.id) {
        refetchNotices();
        refetchFoodMenus();
        qc.refetchQueries({ queryKey: ['rooms', 'pg', selectedPg.id] });
        qc.refetchQueries({ queryKey: ['tenants', 'pg', selectedPg.id] });
      }
    }, [refetchOverview, refetchNotices, refetchFoodMenus, qc, selectedPg?.id])
  );

  const pgSummary = useMemo(
    () => overview?.pgSummaries.find((p) => p.pgId === selectedPg?.id) || overview?.pgSummaries[0],
    [overview, selectedPg]
  );

  const OVERVIEW_ITEMS = useMemo(
    () => [
      {
        label: 'Total Rooms',
        value: String(pgSummary?.totalRooms ?? 0),
        icon: 'bed-outline' as const,
        color: theme.colors.accentPurple,
        bg: '#F3E8FF',
        route: '/(app)/(manager-tabs)/rooms',
      },
      {
        label: 'Total Tenants',
        value: String(pgSummary?.totalTenants ?? 0),
        icon: 'people-outline' as const,
        color: theme.colors.info,
        bg: theme.colors.primarySurface,
        route: '/(app)/(manager-tabs)/tenants',
      },
      {
        label: 'Collected Amount',
        value: `₹${Math.round(pgSummary?.monthlyRevenue ?? 0).toLocaleString()}`,
        icon: 'cash-outline' as const,
        color: theme.colors.success,
        bg: theme.colors.successSurface,
        route: '/screens/collected-amount',
      },
      {
        label: 'Pending Payments',
        value: `₹${Math.round(pgSummary?.pendingDues ?? 0).toLocaleString()}`,
        icon: 'time-outline' as const,
        color: theme.colors.warning,
        bg: theme.colors.warningSurface,
        route: '/screens/pending-dues',
      },
    ],
    [pgSummary, theme]
  );

  const handleEditFoodMenu = (menu: FoodMenu) => {
    router.push({ pathname: '/screens/food-menu' as any, params: { editMenuId: menu.id } });
  };

  const todayLabel = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  const todayWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const incomeValue = `₹${Math.round(pgSummary?.monthlyRevenue ?? 0).toLocaleString()}`;

  return (
    <ScreenWrapper edges={["bottom", "left", "right"]}>
      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
        <HeroHeader
          avatarName={selectedPg?.name || user?.name}
          onAvatarPress={openDrawer}
          onNotificationPress={() => router.push('/screens/notifications' as any)}
          showCount={false}
          height={220}
        />

        {/* Search */}
        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base }}>
          <SearchBar placeholder="Search" value={search} onChangeText={setSearch} />
        </View>

        {/* Hostel Overview */}
        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
            <Ionicons name="business-outline" size={20} color={theme.colors.text} style={{ marginRight: 6 }} />
            <Typography variant="title1">Hostel Overview</Typography>
          </View>
          {overviewLoading ? (
            <Typography variant="body" color={theme.colors.textMuted}>Loading overview...</Typography>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {OVERVIEW_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => item.route && router.push(item.route as any)}
                  style={{ width: '48%', marginBottom: theme.spacing.md }}
                >
                  <Card shadow="sm" padding={theme.spacing.md} style={{ justifyContent: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={item.icon} size={20} color={item.color} style={{ marginRight: 8 }} />
                      <View style={{ flex: 1, flexShrink: 1 }}>
                        <Typography variant="caption" color={theme.colors.textMuted} numberOfLines={1} ellipsizeMode="tail">{item.label}</Typography>
                        <Typography variant="title2" color={item.color} numberOfLines={1} ellipsizeMode="tail" adjustsFontSizeToFit>{item.value}</Typography>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Notices / Food Menu */}
        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={activeTab === 'notices' ? 'newspaper-outline' : 'restaurant-outline'} size={22} color={theme.colors.text} style={{ marginRight: 6 }} />
              <Typography variant="title1">{activeTab === 'notices' ? 'Notice Board' : 'Food Menu'}</Typography>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(activeTab === 'notices' ? ('/screens/notice-board' as any) : ('/screens/food-menu' as any))}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#F6F6F6',
              borderRadius: theme.radius.full,
              padding: 4,
              marginBottom: theme.spacing.md,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('notices')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                borderRadius: theme.radius.full,
                backgroundColor: activeTab === 'notices' ? theme.colors.success : 'transparent',
              }}
            >
              <Ionicons name="newspaper-outline" size={16} color={activeTab === 'notices' ? theme.colors.white : theme.colors.success} />
              <Typography variant="bodyMedium" color={activeTab === 'notices' ? theme.colors.white : theme.colors.success} style={{ marginLeft: 6, fontWeight: '500' }}>
                Notices
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setActiveTab('food')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                borderRadius: theme.radius.full,
                backgroundColor: activeTab === 'food' ? theme.colors.warning : 'transparent',
              }}
            >
              <Ionicons name="restaurant-outline" size={16} color={activeTab === 'food' ? theme.colors.white : theme.colors.warning} />
              <Typography variant="bodyMedium" color={activeTab === 'food' ? theme.colors.white : theme.colors.warning} style={{ marginLeft: 6, fontWeight: '500' }}>
                Food Menu
              </Typography>
            </TouchableOpacity>
          </View>

          {activeTab === 'notices' && (
            noticesLoading ? (
              <Typography variant="body" color={theme.colors.textMuted}>Loading notices...</Typography>
            ) : notices?.notices && notices.notices.length > 0 ? (
              notices.notices.slice(0, 3).map((notice) => (
                <Card key={notice.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                    <Typography variant="title2" color={theme.colors.danger}>{notice.title}</Typography>
                  </View>
                  {notice.senderType && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs }}>
                      <Ionicons name="person-outline" size={12} color={theme.colors.textMuted} />
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>
                        Posted by: {notice.senderType}
                      </Typography>
                    </View>
                  )}
                  <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>
                    {notice.description}
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    Posted: {notice.createdDate ? new Date(notice.createdDate).toLocaleDateString('en-GB') : '-'}
                  </Typography>
                </Card>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
                <Ionicons name="newspaper-outline" size={48} color={theme.colors.border} />
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>No notices yet</Typography>
              </View>
            )
          )}

          {activeTab === 'food' && (
            foodMenusLoading ? (
              <Typography variant="body" color={theme.colors.textMuted}>Loading food menu...</Typography>
            ) : foodMenus && foodMenus.length > 0 ? (
              <>
                <Typography variant="bodyMedium" align="center" style={{ marginBottom: theme.spacing.md }}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.text} /> {todayLabel} ( {todayWeekday} )
                </Typography>
                {foodMenus.slice(0, 2).map((menu, index) => (
                  <Card key={menu.id ?? index} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                      <Typography variant="bodyMedium" style={{ fontSize: 16, textTransform: 'capitalize' }}>
                        {menu.mealType.toLowerCase()}
                      </Typography>
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: theme.spacing.sm }}>
                        ({menu.menuType.toLowerCase()})
                      </Typography>
                    </View>
                    <Card shadow="none" padding={theme.spacing.md} style={{ backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Typography variant="title3" color={theme.colors.warning}>{menu.menuName}</Typography>
                          <Typography variant="caption" color={theme.colors.textMuted} style={{ marginTop: 2 }}>
                            {menu.items.map((i) => i.itemName).join(', ') || 'No items'}
                          </Typography>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.sm }}>
                            <Ionicons name="restaurant-outline" size={14} color={theme.colors.warning} />
                            <Typography variant="captionMedium" color={theme.colors.warning} style={{ marginLeft: 4 }}>
                              {menu.items.length} item{menu.items.length === 1 ? '' : 's'}
                            </Typography>
                          </View>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => handleEditFoodMenu(menu)}>
                          <Ionicons name="create-outline" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  </Card>
                ))}
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
                <Ionicons name="restaurant-outline" size={48} color={theme.colors.border} />
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>No food menu today</Typography>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/screens/income' as any)}
        style={{
          position: 'absolute',
          right: theme.spacing.base,
          bottom: insets.bottom + 4,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          ...theme.shadows.md,
        }}
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.white} />
        <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
          Add Income
        </Typography>
      </TouchableOpacity>
    </View>
    </ScreenWrapper>
  );
}
