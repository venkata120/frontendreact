import { useEffect, useState } from 'react';
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
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { RootState } from '../src/redux/store';
import { getRoleBasedRoute } from '../src/utils/roleRouting';
import { Button, Typography } from '../src/components';
import { useAuth } from '../src/hooks/useAuth';
import type { UserRole } from '../src/types';

const BACKGROUND = '#FFFFFF';
const WAVE_COLOR = '#0A2A5E';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const ROLES: { key: UserRole; label: string; image: any }[] = [
  { key: 'owner', label: 'Owner', image: require('../assets/images/Owner.png') },
  { key: 'manager', label: 'Manager', image: require('../assets/images/Manager.png') },
];

export default function SplashScreen() {
  const router = useRouter();
  const { selectRole } = useAuth();
  const { isAuthenticated, loading, userRole } = useSelector((state: RootState) => state.auth);
  const { width, height } = useWindowDimensions();
  const imageSize = Math.min(width * 0.32, 140);
  const logoSize = Math.min(width * 0.4, 130);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const dipDepth = 80;
  const initialBottom = height * 0.18;
  const finalBottom = height;

  const shapeBottomY = useSharedValue(initialBottom);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const questionOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(30);
  const authOpacity = useSharedValue(0);
  const authTranslateY = useSharedValue(20);

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace(getRoleBasedRoute(userRole));
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

    // Role selection reveals after the wave fills the screen.
    questionOpacity.value = withDelay(2400, withTiming(1, { duration: 500 }));
    cardsOpacity.value = withDelay(2700, withTiming(1, { duration: 500 }));
    cardsTranslateY.value = withDelay(2700, withTiming(0, { duration: 500 }));
  }, [loading, isAuthenticated, userRole, router, shapeBottomY, logoOpacity, logoScale, questionOpacity, cardsOpacity, cardsTranslateY, finalBottom]);

  useEffect(() => {
    if (selectedRole) {
      authOpacity.value = withTiming(1, { duration: 400 });
      authTranslateY.value = withTiming(0, { duration: 400 });
    } else {
      authOpacity.value = 0;
      authTranslateY.value = 20;
    }
  }, [selectedRole, authOpacity, authTranslateY]);

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

  const questionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value,
    transform: [{ translateY: interpolate(questionOpacity.value, [0, 1], [15, 0]) }],
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsTranslateY.value }],
  }));

  const authAnimatedStyle = useAnimatedStyle(() => ({
    opacity: authOpacity.value,
    transform: [{ translateY: authTranslateY.value }],
  }));

  const handleSelectRole = (role: UserRole) => {
    selectRole(role);
    setSelectedRole(role);
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup-owner');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

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
            style={{ width: logoSize, height: logoSize }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Role selection */}
      <View style={styles.rolesWrapper} pointerEvents="box-none">
        <Animated.View style={questionAnimatedStyle}>
          <Typography variant="title1" color="#FFFFFF" style={styles.question}>
            Which Describes you ?
          </Typography>
        </Animated.View>

        <Animated.View style={[styles.rolesRow, cardsAnimatedStyle]}>
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.key;
            return (
              <View
                key={role.key}
                style={[styles.roleCard, isSelected && styles.roleCardSelected]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleSelectRole(role.key)}
                  style={styles.roleButton}
                >
                  <Image source={role.image} style={{ width: imageSize, height: imageSize }} resizeMode="contain" />
                  <Typography variant="bodyMedium" color="#FFFFFF" style={styles.roleLabel}>
                    {role.label}
                  </Typography>
                </TouchableOpacity>
              </View>
            );
          })}
        </Animated.View>

        <Animated.View
          style={[styles.authOptions, authAnimatedStyle]}
          pointerEvents={selectedRole ? 'auto' : 'none'}
        >
          <Button
            title="Sign up as Owner"
            onPress={handleSignUp}
            fullWidth
            style={styles.signupButton}
            textColor="#FFFFFF"
          />
        </Animated.View>

        <View style={styles.loginRow}>
          <Typography variant="bodyMedium" color="rgba(255, 255, 255, 0.8)">
            Already have an account ?{' '}
          </Typography>
          <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
            <Typography variant="bodyMedium" color="#FFFFFF" style={styles.loginText}>
              LOGIN
            </Typography>
          </TouchableOpacity>
        </View>
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
    paddingTop: '24%',
  },
  rolesWrapper: {
    position: 'absolute',
    top: '54%',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  question: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 16,
  },
  rolesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  },
  roleCard: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: 12,
  },
  roleCardSelected: {
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  roleButton: {
    alignItems: 'center',
  },
  roleLabel: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  authOptions: {
    width: '100%',
    marginTop: 28,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#208AEF',
    borderRadius: 28,
    height: 52,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
