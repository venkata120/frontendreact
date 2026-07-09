import { useEffect } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { RootState } from '../src/redux/store';
import { getRoleBasedRoute } from '../src/utils/roleRouting';
import { Typography } from '../src/components';
import { useAuth } from '../src/hooks/useAuth';
import type { UserRole } from '../src/types';

const BG_COLOR = '#25397C';
const WAVE_COLOR = '#ECE4F1';

const ROLES: { key: UserRole; label: string; image: any }[] = [
  { key: 'owner', label: 'Owner', image: require('../assets/images/Owner.png') },
  { key: 'manager', label: 'Manager', image: require('../assets/images/Tenant.png') },
];

export default function SplashScreen() {
  const router = useRouter();
  const { selectRole } = useAuth();
  const { isAuthenticated, loading, userRole } = useSelector((state: RootState) => state.auth);
  const { width, height } = useWindowDimensions();

  // Animation shared values
  const bgBrightness = useSharedValue(0.73);
  const mainWaveY = useSharedValue(height * 0.6);
  const shadowWaveY = useSharedValue(height * 0.65);
  const logoOpacity = useSharedValue(0.3);
  const logoScale = useSharedValue(0.95);
  const roleOpacity = useSharedValue(0);

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace(getRoleBasedRoute(userRole));
      return;
    }

    // Phase 1: Fade-in background (0-500ms)
    bgBrightness.value = withTiming(1, { duration: 500 });

    // Phase 2: Wave rise with elastic overshoot (500-1500ms)
    mainWaveY.value = withDelay(
      500,
      withSpring(0, {
        damping: 12,
        stiffness: 80,
        mass: 1,
        overshootClamping: false,
      })
    );

    // Phase 3: Shadow settle (1000-2000ms)
    shadowWaveY.value = withDelay(
      600,
      withSpring(14, {
        damping: 14,
        stiffness: 70,
        mass: 1.2,
      })
    );

    // Phase 4: Logo stabilize (1000-3300ms)
    logoOpacity.value = withDelay(1000, withTiming(1, { duration: 1500 }));
    logoScale.value = withDelay(1000, withTiming(1, { duration: 1500 }));

    // Phase 5: Role selection reveal (after splash animation completes)
    roleOpacity.value = withDelay(3400, withTiming(1, { duration: 600 }));
  }, [loading, isAuthenticated, userRole, router, bgBrightness, mainWaveY, shadowWaveY, logoOpacity, logoScale, roleOpacity]);

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(bgBrightness.value, [0.73, 1], [0.3, 1]),
  }));

  const mainWaveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mainWaveY.value }],
  }));

  const shadowWaveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: shadowWaveY.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const roleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: roleOpacity.value,
    transform: [{ translateY: interpolate(roleOpacity.value, [0, 1], [30, 0]) }],
  }));

  const handleRolePress = (role: UserRole) => {
    selectRole(role);
    router.replace('/(auth)/login');
  };

  // Wave edge with two gentle dips (local minima)
  const waveBaseY = height * 0.65;
  const leftY = waveBaseY;
  const dip1X = width * 0.3;
  const dip1Y = waveBaseY + 50;
  const crestX = width * 0.55;
  const crestY = waveBaseY - 30;
  const dip2X = width * 0.8;
  const dip2Y = waveBaseY + 40;
  const rightY = waveBaseY + 10;

  const mainWavePath = `
    M -40,${height}
    L -40,${leftY}
    C ${width * 0.1},${leftY} ${dip1X - 40},${dip1Y} ${dip1X},${dip1Y}
    C ${dip1X + 50},${dip1Y} ${crestX - 60},${crestY} ${crestX},${crestY}
    C ${crestX + 60},${crestY} ${dip2X - 50},${dip2Y} ${dip2X},${dip2Y}
    C ${dip2X + 40},${dip2Y} ${width * 0.95},${rightY} ${width + 40},${rightY}
    L ${width + 40},${height}
    Z
  `;

  // Shadow wave path — same contour but offset and slightly softer
  const shadowWavePath = `
    M -40,${height}
    L -40,${leftY + 10}
    C ${width * 0.1},${leftY + 10} ${dip1X - 40},${dip1Y + 10} ${dip1X},${dip1Y + 10}
    C ${dip1X + 50},${dip1Y + 10} ${crestX - 60},${crestY + 10} ${crestX},${crestY + 10}
    C ${crestX + 60},${crestY + 10} ${dip2X - 50},${dip2Y + 10} ${dip2X},${dip2Y + 10}
    C ${dip2X + 40},${dip2Y + 10} ${width * 0.95},${rightY + 10} ${width + 40},${rightY + 10}
    L ${width + 40},${height}
    Z
  `;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Base layer */}
      <Animated.View style={[styles.background, bgAnimatedStyle]} />

      {/* Shadow wave layer */}
      <Animated.View style={[styles.waveContainer, shadowWaveAnimatedStyle]} pointerEvents="none">
        <Svg width={width + 80} height={height} viewBox={`-40 0 ${width + 80} ${height}`} preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="shadowGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#374DA4" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#ACB1D6" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#ECE4F1" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d={shadowWavePath} fill="url(#shadowGradient)" />
        </Svg>
      </Animated.View>

      {/* Main wave layer */}
      <Animated.View style={[styles.waveContainer, mainWaveAnimatedStyle]} pointerEvents="none">
        <Svg width={width + 80} height={height} viewBox={`-40 0 ${width + 80} ${height}`} preserveAspectRatio="none">
          <Path d={mainWavePath} fill={WAVE_COLOR} />
        </Svg>
      </Animated.View>

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

      {/* Role selection */}
      <Animated.View style={[styles.rolesWrapper, roleAnimatedStyle]}>
        <Typography variant="title1" color="#FFFFFF" style={styles.question}>
          Which Describes you ?
        </Typography>
        <View style={styles.rolesRow}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.key}
              activeOpacity={0.85}
              onPress={() => handleRolePress(role.key)}
              style={styles.roleButton}
            >
              <Image source={role.image} style={styles.roleImage} resizeMode="contain" />
              <Typography variant="bodyMedium" color="#FFFFFF" style={styles.roleLabel}>
                {role.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG_COLOR,
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: -40,
    right: -40,
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: '35%',
  },
  logo: {
    width: 180,
    height: 180,
  },
  rolesWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: '8%',
    alignItems: 'center',
  },
  question: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 16,
  },
  rolesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  roleButton: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  roleImage: {
    width: 120,
    height: 120,
  },
  roleLabel: {
    marginTop: 8,
    fontWeight: '600',
  },
});
