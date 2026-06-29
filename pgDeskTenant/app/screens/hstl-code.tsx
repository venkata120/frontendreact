import { useRouter } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Input, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const schema = z.object({
  code: z.string().min(1, 'Hostel code is required'),
});

type FormData = z.infer<typeof schema>;

export default function HstlCodeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    router.push('/(app)/screens/hstl-details-tenant' as any);
  };

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: '#0A2A5E',
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={20} color="#0A2A5E" />
        </TouchableOpacity>
        <Typography variant="headline2" color={theme.colors.white} style={{ marginTop: theme.spacing.lg }}>Enter Hostel Code</Typography>
        <Typography variant="caption" color={theme.colors.white} style={{ opacity: 0.8 }}>Enter Hostel code or scan the QR code provided by the hostel</Typography>
      </View>

      <View style={{ flex: 1, padding: theme.spacing.base }}>
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <Input
              placeholder="Enter hostel code"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.code?.message}
              leftIcon="business-outline"
            />
          )}
        />
      </View>

      <View style={{ padding: theme.spacing.base }}>
        <Button title="Continue" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScreenWrapper>
  );
}
