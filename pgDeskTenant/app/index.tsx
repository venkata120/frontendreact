import { useEffect } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { RootState } from '../src/redux/store';
import { useAuth } from '../src/hooks/useAuth';

console.log('DEBUG: app/index.tsx loaded');

const BACKGROUND = '#FFFFFF';
const WAVE_COLOR = '#0A2A5E';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function SplashScreen() {
  const router = useRouter();
  const { selectRole } = useAuth();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { width, height } = useWindowDimensions();

  const dipDepth = 80;
  const initialBottom = height * 0.18;
  const finalBottom = height;

  const shapeBottomY = useSharedValue(initialBottom);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace('/(app)/(tabs)');
      return;
    }

    // Wave shape expands downward from ~18% to full screen.
    shapeBottomY.value = withDelay(
      600,
      withTiming(finalBottom, {
        duration: 1400,
        easing: Easing.out(Easing.quad),
      })
    );

    // Logo fades in once the wave has room for it.
    logoOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    logoScale.value = withDelay(800, withTiming(1, { duration: 500 }));

    // After the splash reveal finishes, go straight to tenant login.
    const timer = setTimeout(() => {
      selectRole('tenant');
      router.replace('/(auth)/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, router, shapeBottomY, logoOpacity, logoScale, selectRole, finalBottom]);

  const animatedProps = useAnimatedProps(() => {
    const y = shapeBottomY.value;
    const d = `
      M 0,0
      H ${width}
      V ${y}
      C ${width * 0.85},${y} ${width * 0.6},${y + dipDepth} ${width * 0.5},${y + dipDepth}
      C ${width * 0.4},${y + dipDepth} ${width * 0.15},${y} 0,${y}
      Z
    `;
    return { d };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* White base layer */}
      <View style={styles.background} />

      {/* Expanding wave layer */}
      <View style={styles.waveContainer} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <AnimatedPath animatedProps={animatedProps} fill={WAVE_COLOR} />
        </Svg>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer} pointerEvents="none">
        <Animated.View style={logoAnimatedStyle}>
          <Image
            source={require('../assets/images/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKGROUND,
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: '28%',
  },
  logo: {
    width: 180,
    height: 180,
  },
});
