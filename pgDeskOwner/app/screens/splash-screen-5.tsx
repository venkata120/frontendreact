import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function SplashScreen() {
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/role-select' as any);
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: '#0A2A5E',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40,
        }}
      >
        <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: theme.colors.white, transform: [{ rotate: '25deg' }], marginLeft: -100 }} />
        <View style={{ alignItems: 'center', zIndex: 1 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <Ionicons name="business" size={56} color={theme.colors.white} />
            <Ionicons name="checkmark" size={32} color={theme.colors.white} style={{ position: 'absolute', bottom: 8, right: 8 }} />
          </View>
          <Typography variant="headline1" color={theme.colors.white}>PGDesk</Typography>
          <Typography variant="body" color={theme.colors.white} style={{ opacity: 0.8 }}>Property Management Software</Typography>
        </View>
      </View>
    </ScreenWrapper>
  );
}
