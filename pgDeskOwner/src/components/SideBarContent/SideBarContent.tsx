import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Image, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Avatar } from '../';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSelectedPg } from '../../context/SelectedPgContext';
import { useProperties } from '../../hooks/queries';

interface Props {
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  onPress?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const SideBarContent: React.FC<Props> = ({ onClose }) => {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { selectedPg } = useSelectedPg();
  const isManager = user?.role === 'manager';

  const handleNavigate = (item: MenuItem) => {
    if (item.onPress) {
      item.onPress();
      return;
    }
    if (!item.route) {
      onClose?.();
      return;
    }
    router.push(item.route as any);
    onClose?.();
  };

  const handleShareApp = async () => {
    try {
      await Share.share({ message: 'Check out PG Desk - the easiest way to manage your PG!' });
    } catch {
      // ignore
    }
    onClose?.();
  };

  const { data: properties } = useProperties(user?.id);
  const handleMyProperty = () => {
    const pgId = selectedPg?.id || properties?.[0]?.id;
    if (!pgId) return;
    onClose?.();
    setTimeout(() => {
      router.navigate({ pathname: '/screens/add-property', params: { propertyId: pgId } } as any);
    }, 300);
  };

  const ownerMenu: MenuSection[] = [
    {
      title: 'Dashboard',
      items: [
        { label: 'Dashboard', icon: 'home', route: '/(app)/(tabs)' },
        { label: 'Create Property', icon: 'add-circle', route: '/screens/add-property' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'My Profile', icon: 'person', route: '/screens/profile-screen-1' },
        { label: 'Manager', icon: 'person', route: '/screens/manager-profile' },
        { label: 'My Property', icon: 'business', onPress: handleMyProperty },
        { label: 'Wallet', icon: 'wallet' },
        { label: 'Notifications', icon: 'notifications', route: '/screens/notifications' },
      ],
    },
  ];

  const managerMenu: MenuSection[] = [
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: 'person', route: '/screens/manager-profile' },
        { label: 'My Property', icon: 'business', onPress: handleMyProperty },
        { label: 'Notifications', icon: 'notifications', route: '/screens/notifications' },
      ],
    },
    {
      title: 'Help & Support',
      items: [
        { label: 'Help Center', icon: 'help-circle', route: '/screens/help-support' },
        { label: 'Privacy Policy', icon: 'shield-checkmark', route: '/screens/help-support' },
        { label: 'Share App', icon: 'share-outline', onPress: handleShareApp },
      ],
    },
  ];

  const MENU = isManager ? managerMenu : ownerMenu;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: theme.colors.primary,
            borderBottomRightRadius: 40,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.base,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Avatar size={60} uri="" name={isManager ? selectedPg?.name : user?.name} />
              <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                <Typography variant="title1" color={theme.colors.white}>
                  {isManager ? selectedPg?.name || 'PG' : user?.name || 'Owner'}
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons name="location" size={12} color={theme.colors.white} />
                  <Typography variant="caption" color={theme.colors.white}>{selectedPg?.city || 'Madhapur'}</Typography>
                </View>
                {isManager ? (
                  <Typography variant="caption" color={theme.colors.white}>Code: {selectedPg?.id?.slice(-8).toUpperCase() || 'PG'}</Typography>
                ) : (
                  <Typography variant="caption" color={theme.colors.white}>{user?.email}</Typography>
                )}
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
                  onPress={() => handleNavigate(item)}
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
                    <Ionicons name={item.icon} size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
                    <Typography variant="bodyMedium">{item.label}</Typography>
                  </View>
                  {item.label === 'Create Property' ? (
                    <Ionicons name="add" size={20} color={theme.colors.textMuted} />
                  ) : item.label === 'Share App' ? (
                    <Ionicons name="share-outline" size={18} color={theme.colors.textMuted} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {isManager && <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Others</Typography>}
          {!isManager && (
            <>
              <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Help & Support</Typography>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { router.push('/screens/help-support' as any); onClose?.(); }}
                style={{
                  backgroundColor: theme.colors.primarySurface,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  marginBottom: theme.spacing.lg,
                }}
              >
                <Typography variant="bodyMedium">Help & Support</Typography>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              onClose?.();
              Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Yes',
                    onPress: async () => {
                      await signOut();
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
    </View>
  );
};
