import { useRouter } from 'expo-router';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Input, StepIndicator } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useCreateProperty } from '../../src/hooks/queries';

const schema = z.object({
  hostelName: z.string().min(2, 'Hostel name is required'),
  type: z.string().min(1, 'Type of hostel is required'),
  floors: z.string().min(1, 'Floors is required'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { icon: 'person' as const },
  { icon: 'business' as const },
  { icon: 'checkmark' as const },
];

const HOSTEL_TYPES = ['MEN', 'LADIES', 'CO_LIVE'];

export default function InstallationOfPropertyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { setSelectedPg } = useSelectedPg();
  const createProperty = useCreateProperty();

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'MEN' },
  });

  const selectedType = watch('type');
  // advanceAmount is not collected during initial property installation

  const onSubmit = async (data: FormData) => {
    try {
      const pgType = data.type.toUpperCase() as 'MEN' | 'LADIES' | 'CO_LIVE';
      const property = await createProperty.mutateAsync({
        name: data.hostelName,
        address: data.address,
        city: data.city,
        ownerId: user?.id || '',
        pgType,
        numberOfFloors: Number(data.floors) || undefined,
      });
      setSelectedPg(property);
      router.push({
        pathname: '/(auth)/review-details',
        params: { propertyId: property.id },
      });
    } catch {
      // error shown by mutation
    }
  };

  return (
    <ScreenWrapper avoidKeyboard style={{ backgroundColor: '#8FA3B8' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
            <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
              <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: theme.spacing.lg, width: 40 }}>
                <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
              </TouchableOpacity>

              <StepIndicator steps={STEPS} currentStep={1} style={{ marginBottom: theme.spacing.xl }} />

              <View style={{ marginBottom: theme.spacing.lg }}>
                <Typography variant="headline2" color={theme.colors.white} align="center">
                  Installation of Property
                </Typography>
                <Typography variant="body" color="rgba(255,255,255,0.8)" align="center" style={{ marginTop: theme.spacing.sm }}>
                  Please provide property details
                </Typography>
              </View>

              <View
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: theme.radius.xl,
                  padding: theme.spacing.lg,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                <Typography variant="title1" style={{ marginBottom: theme.spacing.lg }}>Basic Details</Typography>

                <Controller
                  control={control}
                  name="hostelName"
                  render={({ field }) => (
                    <Input
                      label="Hostel Name"
                      placeholder="Enter hostel name"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.hostelName?.message}
                    />
                  )}
                />

                <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>Type of Hostel</Typography>
                <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
                  {HOSTEL_TYPES.map((type) => {
                    const isSelected = selectedType?.toUpperCase() === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        activeOpacity={0.8}
                        onPress={() => setValue('type', type, { shouldValidate: true })}
                        style={{
                          flex: 1,
                          paddingVertical: theme.spacing.sm,
                          marginRight: type !== 'CO_LIVE' ? theme.spacing.sm : 0,
                          borderRadius: theme.radius.md,
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.backgroundSecondary,
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="bodyMedium" color={isSelected ? theme.colors.white : theme.colors.text}>
                          {type === 'CO_LIVE' ? 'Co-Live' : type === 'MEN' ? 'Boys' : 'Girls'}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.type && (
                  <Typography variant="caption" color={theme.colors.danger} style={{ marginBottom: theme.spacing.sm }}>
                    {errors.type.message}
                  </Typography>
                )}

                <Controller
                  control={control}
                  name="floors"
                  render={({ field }) => (
                    <Input
                      label="Floors"
                      placeholder="Enter number of floors"
                      keyboardType="numeric"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.floors?.message}
                      leftIcon="layers-outline"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <Input
                      label="City"
                      placeholder="Enter city"
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.city?.message}
                      leftIcon="location-outline"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <Input
                      label="Hostel Address"
                      placeholder="Enter hostel address"
                      multiline
                      numberOfLines={3}
                      value={field.value}
                      onChangeText={field.onChange}
                      error={errors.address?.message}
                      inputStyle={{ height: 80, textAlignVertical: 'top' }}
                    />
                  )}
                />
              </View>

              {createProperty.isError && (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                  {(createProperty.error as any)?.response?.data?.message || 'Failed to create property'}
                </Typography>
              )}
            </View>
          </ScrollView>

          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.colors.white,
              paddingHorizontal: theme.spacing.base,
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.lg,
            }}
          >
            <Button title="Next" loading={createProperty.isPending} onPress={handleSubmit(onSubmit)} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
