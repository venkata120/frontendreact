import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScreenWrapper, Typography } from '../../src/components';

export default function PendingDuesEmptyStateScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/screens/pending-dues' as any);
  }, [router]);

  return (
    <ScreenWrapper>
      <Typography variant="body" style={{ textAlign: 'center', marginTop: 40 }}>Redirecting...</Typography>
    </ScreenWrapper>
  );
}
