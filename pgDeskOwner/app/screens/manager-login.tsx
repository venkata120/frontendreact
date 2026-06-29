import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScreenWrapper, Typography } from '../../src/components';

export default function ManagerLoginScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(auth)/login' as any);
  }, [router]);

  return (
    <ScreenWrapper>
      <Typography variant="body" style={{ textAlign: 'center', marginTop: 40 }}>Redirecting...</Typography>
    </ScreenWrapper>
  );
}
