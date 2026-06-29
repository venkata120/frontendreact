import { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../src/redux/store';
import { getRoleBasedRoute } from '../src/utils/roleRouting';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, loading, userRole } = useSelector((state: RootState) => state.auth);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse/glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate after splash duration
    const timer = setTimeout(() => {
      if (!loading) {
        if (isAuthenticated) {
          router.replace(getRoleBasedRoute(userRole));
        } else {
          router.replace('/(auth)/role-select');
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, userRole, router, fadeAnim, scaleAnim, glowAnim]);

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0A2A5E',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Animated glow ring */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: '#1E5FCC',
          opacity: glowOpacity,
          transform: [{ scale: glowScale }],
        }}
      />

      {/* Logo with scale + fade */}
      <Animated.Image
        source={require('../assets/images/Logo.png')}
        style={{
          width: 180,
          height: 180,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        resizeMode="contain"
      />
    </View>
  );
}
