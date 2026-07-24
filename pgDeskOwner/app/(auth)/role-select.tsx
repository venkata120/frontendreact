import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { ScreenWrapper, Typography, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import type { UserRole } from '../../src/types';

const ROLES = [
  {
    key: 'owner' as UserRole,
    label: 'Owner',
    description: 'Manage properties, tenants & staff',
    image: require('../../assets/images/Owner.png'),
    bgColor: '#E6F0FF',
    borderColor: '#0065F4',
  },
  {
    key: 'manager' as UserRole,
    label: 'Manager',
    description: 'Oversee daily operations & teams',
    image: require('../../assets/images/Manager.png'),
    bgColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
];

export default function RoleSelectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { selectRole } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // role-select is the post-logout fallback; send users to the animated splash screen
    router.replace('/');
    const timer = setTimeout(() => setIsRedirecting(false), 300);
    return () => clearTimeout(timer);
  }, [router]);

  const handleSelect = (role: UserRole) => {
    selectRole(role);
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    selectRole('owner');
    router.push('/(auth)/signup-owner');
  };

  if (isRedirecting) {
    return (
      <View style={{ flex: 1, backgroundColor: '#25397C' }} />
    );
  }

  return (
    <ScreenWrapper scrollable>
      <View
        style={{
          flex: 1,
          padding: theme.spacing.base,
          paddingTop: theme.spacing['3xl'],
          paddingBottom: theme.spacing.xl,
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../assets/images/Logo.png')}
          style={{ width: 100, height: 100, marginBottom: theme.spacing.lg }}
          resizeMode="contain"
        />

        <Typography variant="headline1" align="center" style={{ marginBottom: theme.spacing.sm }}>
          Welcome to PGDesk
        </Typography>
        <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing['3xl'] }}>
          Select your role to continue
        </Typography>

        <View style={{ width: '100%' }}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.key}
              activeOpacity={0.9}
              onPress={() => handleSelect(role.key)}
              style={{
                width: '100%',
                backgroundColor: role.bgColor,
                borderRadius: theme.radius.xl,
                borderWidth: 2,
                borderColor: role.borderColor,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: role.borderColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <Image
                source={role.image}
                style={{ width: 100, height: 90, marginRight: theme.spacing.md }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Typography variant="title1" color={role.borderColor}>
                  {role.label}
                </Typography>
                <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                  {role.description}
                </Typography>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ width: '100%', marginTop: theme.spacing.xl }}>
          <Button
            title="Register as Owner"
            variant="outline"
            onPress={handleRegister}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.md }}>
            <Typography variant="body" color={theme.colors.textMuted}>
              Already have an account?
            </Typography>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Typography variant="bodyMedium" color={theme.colors.primary} style={{ marginLeft: 4, fontWeight: '600' }}>
                Login
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
