import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { AppProviders } from '../src/components';
import { loadSession } from '../src/redux/slices/authSlice';
import { store, RootState } from '../src/redux/store';
import { useTheme } from '../src/hooks/useTheme';
import { getRoleBasedRoute } from '../src/utils/roleRouting';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments() as string[];
  const { isAuthenticated, loading, userRole } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    store.dispatch(loadSession());
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const inSplash = segments.length === 0 || segments[0] === 'index';

    if (!isAuthenticated && !inAuthGroup && !inSplash) {
      router.replace('/(auth)/role-select');
      return;
    }

    if (isAuthenticated && userRole && (inAuthGroup || inSplash)) {
      router.replace(getRoleBasedRoute(userRole));
      return;
    }

    // Re-route if user somehow lands in the wrong tab group
    if (isAuthenticated && userRole && inAppGroup) {
      const expectedRoute = getRoleBasedRoute(userRole);
      const expectedGroup = expectedRoute.replace('/index', '');
      const currentGroup = `/(app)/${segments[1]}`;
      const isTabGroup = currentGroup === '/(app)/(tabs)' || currentGroup === '/(app)/(manager-tabs)';
      if (isTabGroup && currentGroup !== expectedGroup && segments.length <= 2) {
        router.replace(expectedRoute);
      }
    }
  }, [isAuthenticated, loading, segments, userRole, router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}
