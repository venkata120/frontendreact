import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Button, Input, Header } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { tenantsService } from '../../src/api/services/tenants';

const nameRegex = /^[A-Za-z\s]+$/;
const mobileRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const schema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name is required')
    .max(50, 'Name is too long')
    .regex(nameRegex, 'Full name must contain only alphabets'),
  mobile: z
    .string()
    .regex(mobileRegex, 'Enter a valid 10-digit mobile number starting with 6-9'),
  parentName: z
    .string()
    .min(2, 'Parent name is required')
    .max(50, 'Parent name is too long')
    .regex(nameRegex, 'Parent name must contain only alphabets'),
  parentMobile: z
    .string()
    .regex(mobileRegex, 'Enter a valid 10-digit mobile number starting with 6-9'),
  dob: z
    .string()
    .regex(dobRegex, 'Select a valid date of birth'),
  aadhaar: z
    .string()
    .regex(aadhaarRegex, 'Aadhaar number must be 12 digits'),
});

type FormData = z.infer<typeof schema>;

function formatDate(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day };
}

function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const initial = value ? parseDate(value) : { year: 2000, month: 0, day: 1 };

  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedDay, setSelectedDay] = useState(initial.day);

  useEffect(() => {
    const next = value ? parseDate(value) : { year: 2000, month: 0, day: 1 };
    setSelectedYear(next.year);
    setSelectedMonth(next.month);
    setSelectedDay(next.day);
  }, [value]);

  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    onSelect(formatDate(selectedYear, selectedMonth, selectedDay));
    onClose();
  };

  const pillStyle = (selected: boolean): any => ({
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: selected ? theme.colors.primary : theme.colors.backgroundSecondary,
    marginRight: theme.spacing.sm,
    minWidth: 64,
    alignItems: 'center',
  });

  const pillTextColor = (selected: boolean) => (selected ? theme.colors.white : theme.colors.text);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.md,
            }}
          >
            <Typography variant="title1">Select Date of Birth</Typography>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>Year</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.base }}>
            {years.map((year) => (
              <TouchableOpacity key={year} onPress={() => setSelectedYear(year)} style={pillStyle(selectedYear === year)}>
                <Typography variant="bodyMedium" color={pillTextColor(selectedYear === year)}>{year}</Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>Month</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.base }}>
            {months.map((month, index) => (
              <TouchableOpacity key={month} onPress={() => setSelectedMonth(index)} style={pillStyle(selectedMonth === index)}>
                <Typography variant="bodyMedium" color={pillTextColor(selectedMonth === index)}>{month}</Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Typography variant="bodyMedium" style={{ marginBottom: theme.spacing.sm }}>Day</Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.lg }}>
            {days.map((day) => (
              <TouchableOpacity key={day} onPress={() => setSelectedDay(day)} style={pillStyle(selectedDay === day)}>
                <Typography variant="bodyMedium" color={pillTextColor(selectedDay === day)}>{day}</Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button title="Confirm" onPress={handleConfirm} />
        </View>
      </View>
    </Modal>
  );
}

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      mobile: '',
      parentName: '',
      parentMobile: '',
      dob: '',
      aadhaar: '',
    },
  });

  const dobValue = watch('dob');

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await tenantsService.create({
        fullName: data.fullName,
        phone: data.mobile,
        emergencyContact: data.parentMobile,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
        rentPerMonth: 0,
      } as any);
      Alert.alert('Account created', 'Please log in with your registered mobile number.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      Alert.alert('Signup failed', message);
    } finally {
      setLoading(false);
    }
  };

  const displayDob = dobValue
    ? (() => {
        const { year, month, day } = parseDate(dobValue);
        return `${String(day).padStart(2, '0')} ${months[month]} ${year}`;
      })()
    : '';

  return (
    <ScreenWrapper>
      <Header onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.base, paddingBottom: theme.spacing.xl }}>
          <Typography variant="headline2" align="center" style={{ marginTop: theme.spacing.lg }}>
            Create Account
          </Typography>
          <Typography variant="body" align="center" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
            Register as a tenant
          </Typography>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full Name *"
                placeholder="Enter full name"
                autoCapitalize="words"
                maxLength={50}
                value={value}
                onChangeText={(text) => onChange(text.replace(/[^A-Za-z\s]/g, ''))}
                onBlur={onBlur}
                error={errors.fullName?.message}
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Controller
            control={control}
            name="mobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Mobile Number *"
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 10))}
                onBlur={onBlur}
                error={errors.mobile?.message}
                leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Controller
            control={control}
            name="parentName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Parent Name *"
                placeholder="Enter parent name"
                autoCapitalize="words"
                maxLength={50}
                value={value}
                onChangeText={(text) => onChange(text.replace(/[^A-Za-z\s]/g, ''))}
                onBlur={onBlur}
                error={errors.parentName?.message}
                leftIcon={<Ionicons name="people-outline" size={20} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Controller
            control={control}
            name="parentMobile"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Parent Mobile Number *"
                placeholder="Enter parent mobile"
                keyboardType="phone-pad"
                maxLength={10}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 10))}
                onBlur={onBlur}
                error={errors.parentMobile?.message}
                leftIcon={<Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Controller
            control={control}
            name="dob"
            render={({ field: { value } }) => (
              <View>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setShowDatePicker(true)}>
                  <View pointerEvents="none">
                    <Input
                      label="Date of Birth *"
                      placeholder="Select date of birth"
                      value={displayDob}
                      editable={false}
                      error={errors.dob?.message}
                      leftIcon={<Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />}
                    />
                  </View>
                </TouchableOpacity>
                <DatePickerModal
                  visible={showDatePicker}
                  value={value}
                  onSelect={(date) => setValue('dob', date, { shouldValidate: true })}
                  onClose={() => setShowDatePicker(false)}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="aadhaar"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Aadhaar Number *"
                placeholder="Enter 12-digit Aadhaar number"
                keyboardType="number-pad"
                maxLength={12}
                value={value}
                onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 12))}
                onBlur={onBlur}
                error={errors.aadhaar?.message}
                leftIcon={<Ionicons name="card-outline" size={20} color={theme.colors.textMuted} />}
              />
            )}
          />

          <Button
            title="Sign Up"
            loading={loading}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: theme.spacing.lg }}
          />

          <Button
            title="Already have an account? Login"
            variant="ghost"
            onPress={() => router.replace('/(auth)/login')}
            style={{ marginTop: theme.spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
