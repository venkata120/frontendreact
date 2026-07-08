import { useRouter } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Input, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, loading, error, resetError } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    resetError();
    try {
      await login(data.email, data.password, 'tenant');
      router.replace('/(app)/(tabs)');
    } catch {
      // error handled by auth slice
    }
  };

  return (
    <ScreenWrapper avoidKeyboard>
      <Header onBack={() => router.back()} />
      <View style={{ flex: 1, paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
        <Typography variant="headline2" align="center">
          Welcome back Tenant!
        </Typography>
        <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
          Login to your tenant account
        </Typography>

        <View style={{ alignItems: 'center', marginVertical: theme.spacing['3xl'] }}>
          <Image
            source={{ uri: 'https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg' }}
            style={{ width: 260, height: 200 }}
            resizeMode="contain"
          />
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
              leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter your password"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />}
              containerStyle={{ marginTop: theme.spacing.sm }}
            />
          )}
        />

        {error && (
          <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
            {error}
          </Typography>
        )}

        <Button
          title="Login"
          loading={loading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: theme.spacing.lg }}
        />
      </View>
    </ScreenWrapper>
  );
}
