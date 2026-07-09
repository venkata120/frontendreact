import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, HeroHeader } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useDashboardOverview, useAnnouncementsByPg, useFoodMenusByProperty, useDeleteFoodMenu } from '../../../src/hooks/queries';
import type { FoodMenu } from '../../../src/types';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();

  const currentMonth = useMemo(() => String(new Date().getMonth() + 1).padStart(2, '0'), []);
  const currentYear = useMemo(() => String(new Date().getFullYear()), []);
  const isOwner = user?.role === 'owner';
  const overviewParams = useMemo(
    () => ({ month: currentMonth, year: currentYear, userId: user?.id, ownerId: isOwner ? user?.id : undefined }),
    [currentMonth, currentYear, user?.id, isOwner]
  );
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useDashboardOverview(overviewParams);
  const { data: announcements, isLoading: announcementsLoading, refetch: refetchAnnouncements } = useAnnouncementsByPg(selectedPg?.id);
  const { data: foodMenus, isLoading: foodMenusLoading, refetch: refetchFoodMenus } = useFoodMenusByProperty(selectedPg?.id);
  const deleteMenu = useDeleteFoodMenu();

  useFocusEffect(
    useCallback(() => {
      refetchOverview();
      if (selectedPg?.id) {
        refetchAnnouncements();
        qc.refetchQueries({ queryKey: ['rooms', 'pg', selectedPg.id] });
        qc.refetchQueries({ queryKey: ['tenants', 'pg', selectedPg.id] });
        refetchFoodMenus();
      }
    }, [refetchOverview, refetchAnnouncements, refetchFoodMenus, qc, selectedPg?.id])
  );

  const pgSummary = useMemo(
    () => overview?.pgSummaries.find((p) => p.pgId === selectedPg?.id),
    [overview, selectedPg]
  );
  const leftTenants = useMemo(
    () => Math.max(0, (pgSummary?.totalTenants ?? 0) - (pgSummary?.activeTenants ?? 0)),
    [pgSummary]
  );

  const OVERVIEW_ITEMS = [
    {
      label: 'Total Rooms',
      value: String(pgSummary?.totalRooms ?? 0),
      icon: 'bed-outline',
      color: theme.colors.secondary,
      bg: theme.colors.primarySurface,
      route: '/(app)/(tabs)/rooms',
    },
    {
      label: 'Total Tenants',
      value: String(pgSummary?.totalTenants ?? 0),
      icon: 'people-outline',
      color: theme.colors.info,
      bg: theme.colors.primarySurface,
      route: '/(app)/(tabs)/tenants',
    },
    {
      label: 'Active Tenants',
      value: String(pgSummary?.activeTenants ?? 0),
      icon: 'people',
      color: theme.colors.success,
      bg: theme.colors.successSurface,
      route: '/(app)/(tabs)/tenants',
    },
    {
      label: 'Left Tenants',
      value: String(leftTenants),
      icon: 'person-remove',
      color: theme.colors.textTertiary,
      bg: theme.colors.backgroundSecondary,
      route: '/screens/left-tenants-profile',
    },
    {
      label: 'Collected Amount',
      value: `₹${Math.round(pgSummary?.monthlyRevenue ?? overview?.totalMonthlyRevenue ?? 0).toLocaleString()}`,
      icon: 'cash-outline',
      color: theme.colors.success,
      bg: theme.colors.successSurface,
      route: '/screens/collected-amount',
    },
    {
      label: 'Pending Payments',
      value: `₹${Math.round(pgSummary?.pendingDues ?? overview?.totalPendingDues ?? 0).toLocaleString()}`,
      icon: 'time-outline',
      color: theme.colors.warning,
      bg: theme.colors.warningSurface,
      route: '/screens/pending-dues',
    },
  ];

  const [activeTab, setActiveTab] = useState<'notices' | 'food'>('food');

  const handleEditFoodMenu = (menu: FoodMenu) => {
    router.push({ pathname: '/screens/food-menu' as any, params: { editMenuId: menu.id } });
  };

  const handleDeleteFoodMenu = (menu: FoodMenu) => {
    Alert.alert('Delete Menu', `Are you sure you want to delete "${menu.menuName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!menu.id || !selectedPg?.id) return;
          deleteMenu.mutate({ menuId: menu.id, propertyId: selectedPg.id });
        },
      },
    ]);
  };

  return (
    <ScreenWrapper edges={["bottom", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroHeader
          avatarName={user?.name}
          onAvatarPress={openDrawer}
          onNotificationPress={() => router.push('/screens/notifications' as any)}
          showCount={true}
          height={220}
        />

        <SearchBar placeholder="Search" />

        {/* Hostel Overview */}
        <View style={{ paddingHorizontal: theme.spacing.base }}>
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
                <Card
                  shadow="sm"
                  padding={theme.spacing.md}
                  style={{ minHeight: 90, justifyContent: 'center' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        backgroundColor: item.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={item.icon as any} size={24} color={item.color} />
                    </View>
                    <View style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
                      <Typography variant="caption" color={theme.colors.textMuted} numberOfLines={1} ellipsizeMode="tail">
                        {item.label}
                      </Typography>
                      <Typography variant="title2" color={item.color} numberOfLines={1}>
                        {item.value}
                      </Typography>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                  </View>
                </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Food Menu */}
        <View style={{ paddingHorizontal: theme.spacing.base, marginTop: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={activeTab === 'notices' ? 'newspaper-outline' : 'restaurant-outline'} size={22} color={theme.colors.text} style={{ marginRight: 6 }} />
              <Typography variant="title1">{activeTab === 'notices' ? 'Notices' : 'Food Menu'}</Typography>
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

          <Typography variant="bodyMedium" align="center" style={{ marginBottom: theme.spacing.md }}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.text} /> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')} ( {new Date().toLocaleDateString('en-US', { weekday: 'long' })} )
          </Typography>

          {activeTab === 'food' && (
            foodMenusLoading ? (
              <Typography variant="body" color={theme.colors.textMuted}>Loading food menu...</Typography>
            ) : foodMenus && foodMenus.length > 0 ? (
              foodMenus.map((menu, index) => (
                <Card key={menu.id ?? index} shadow="md" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <Typography variant="bodyMedium" style={{ fontSize: 16, textTransform: 'capitalize' }}>
                      {menu.mealType.toLowerCase()}
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: theme.spacing.sm }}>
                      ({menu.menuType.toLowerCase()})
                    </Typography>
                  </View>
                  <Card
                    shadow="none"
                    padding={theme.spacing.md}
                    style={{ backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Typography variant="title3" color={theme.colors.warning}>
                          {menu.menuName}
                        </Typography>
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
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => handleEditFoodMenu(menu)} style={{ marginRight: theme.spacing.sm }}>
                          <Ionicons name="create-outline" size={20} color={theme.colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => handleDeleteFoodMenu(menu)}>
                          <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                </Card>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
                <Ionicons name="restaurant-outline" size={48} color={theme.colors.border} />
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                  No content
                </Typography>
              </View>
            )
          )}

          {activeTab === 'notices' && (
            announcementsLoading ? (
              <Typography variant="body" color={theme.colors.textMuted}>Loading notices...</Typography>
            ) : announcements && announcements.length > 0 ? (
              announcements.map((notice) => (
                <Card key={notice.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                    <Typography variant="title2" color={theme.colors.danger}>{notice.title}</Typography>
                    <Ionicons name="pin" size={18} color={theme.colors.primary} />
                  </View>
                  <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>
                    {notice.description}
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    Posted: {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-GB') : '-'}
                  </Typography>
                </Card>
              ))
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
                <Ionicons name="newspaper-outline" size={48} color={theme.colors.border} />
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                  No notices yet
                </Typography>
                <TouchableOpacity
                  onPress={() => router.push('/screens/notice-board' as any)}
                  style={{
                    marginTop: theme.spacing.md,
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.sm,
                    borderRadius: theme.radius.full,
                  }}
                >
                  <Typography variant="bodyMedium" color={theme.colors.white}>Create Notice</Typography>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </ScreenWrapper>
  );
}
