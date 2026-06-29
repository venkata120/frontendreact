import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { ScreenWrapper, Typography } from '../../src/components';

export default function OTPScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 100);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body" color="#888">
          Redirecting to login...
        </Typography>
      </View>
    </ScreenWrapper>
  );
}
