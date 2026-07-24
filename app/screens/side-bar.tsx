import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Avatar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useProperties } from '../../src/hooks/queries';

export default function SideBarScreen() {
  const theme = useTheme();
  const router = useRouter();
  const qc = useQueryClient();
  const { user, signOut } = useAuth();
  const { selectedPg } = useSelectedPg();

  const { data: properties } = useProperties(user?.id);
  const handleMyProperty = () => {
    if (!properties || properties.length === 0) {
      Alert.alert(
        'No Property Found',
        'Please create a property using the Create Property option first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Property', onPress: () => router.push('/screens/add-property' as any) },
        ]
      );
      return;
    }
    if (properties.length > 1) {
      router.push('/screens/select-property' as any);
    } else {
      const pgId = selectedPg?.id || properties[0]?.id;
      router.navigate({ pathname: '/screens/add-property', params: { propertyId: pgId } } as any);
    }
  };

  const MENU = [
    {
      title: 'Dashboard',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/(app)/(tabs)' },
        { label: 'Create Property', icon: 'add-circle', route: '/(app)/screens/add-property' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: 'person', route: '/(app)/profile' },
        { label: 'Manager', icon: 'person', route: '/(app)/screens/manager-profile' },
        { label: 'My Property', icon: 'business', onPress: handleMyProperty },
        { label: 'Wallet', icon: 'wallet', route: '' },
        { label: 'Notifications', icon: 'notifications', route: '/(app)/screens/notifications' },
      ],
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderBottomRightRadius: 40,
            paddingTop: theme.spacing.xl,
            paddingBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.base,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar size={60} uri="" name={user?.name || selectedPg?.name} />
              <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                <Typography variant="title1" color={theme.colors.white}>{user?.name || 'Owner'}</Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="location" size={12} color={theme.colors.white} />
                  <Typography variant="caption" color={theme.colors.white}>{selectedPg?.city || 'Madhapur'}</Typography>
                </View>
                <Typography variant="caption" color={theme.colors.white}>{user?.email}</Typography>
              </View>
            </View>
            <Image
              source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${selectedPg?.id || 'PG'}` }}
              style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: theme.colors.white }}
            />
          </View>
        </View>

        <View style={{ padding: theme.spacing.base }}>
          {MENU.map((section) => (
            <View key={section.title} style={{ marginBottom: theme.spacing.lg }}>
              <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>{section.title}</Typography>
              {section.items.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.onPress) {
                      item.onPress();
                    } else if (item.route) {
                      router.push(item.route as any);
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: theme.colors.primarySurface,
                    padding: theme.spacing.md,
                    borderRadius: theme.radius.md,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
                    <Typography variant="bodyMedium">{item.label}</Typography>
                  </View>
                  {item.label === 'Create Property' ? (
                    <Ionicons name="add" size={20} color={theme.colors.textMuted} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Help & Support</Typography>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/help' as any)}
            style={{
              backgroundColor: theme.colors.primarySurface,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              marginBottom: theme.spacing.lg,
            }}
          >
            <Typography variant="bodyMedium">Help & Support</Typography>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'No', style: 'cancel' },
                  {
                text: 'Yes',
                onPress: async () => {
                  await signOut();
                  qc.removeQueries({ queryKey: ['properties'] });
                  qc.removeQueries({ queryKey: ['dashboard'] });
                },
              },
                ]
              );
            }}
            style={{
              backgroundColor: theme.colors.danger,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              alignItems: 'center',
            }}
          >
            <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>Logout</Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
