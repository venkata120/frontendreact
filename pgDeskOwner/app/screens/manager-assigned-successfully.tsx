import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Avatar, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function ManagerAssignedSuccessfullyScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing['3xl'] }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.successSurface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              <Ionicons name="checkmark" size={40} color={theme.colors.success} />
            </View>
            <Typography variant="headline2">Manager Assigned Successfully !</Typography>
          </View>

          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Ionicons name="person" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
              <Typography variant="title1">Manager Details</Typography>
            </View>

            <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <Avatar size={80} uri="https://i.pravatar.cc/150?u=venkat" name="Venkat.K" />
            </View>

            {[
              { label: 'Name', value: 'Venkat.K', icon: 'person-outline' },
              { label: 'Phone no', value: '9876543210', icon: 'call-outline' },
              { label: 'Role', value: 'Manager', icon: 'briefcase-outline' },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={item.icon as any} size={16} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
                  <Typography variant="body" color={theme.colors.textMuted}>{item.label}</Typography>
                </View>
                <Typography variant="bodyMedium">{item.value}</Typography>
              </View>
            ))}
          </Card>

          <Card shadow="md" padding={theme.spacing.lg} style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="lock-closed" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <View>
                  <Typography variant="title1">Login Credentials</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>Share these details securely</Typography>
                </View>
              </View>
              <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Typography variant="caption" color={theme.colors.textMuted}>Copy</Typography>
                <Ionicons name="copy-outline" size={16} color={theme.colors.textMuted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Login ID', value: 'SVPG2026', icon: 'card-outline' },
              { label: 'Password', value: 'Svpg@123', icon: 'key-outline' },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={item.icon as any} size={16} color={theme.colors.textMuted} style={{ marginRight: 8 }} />
                  <Typography variant="body" color={theme.colors.textMuted}>{item.label}</Typography>
                </View>
                <Typography variant="bodyMedium">{item.value}</Typography>
              </View>
            ))}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.md }}>
              <Ionicons name="information-circle-outline" size={14} color={theme.colors.warning} />
              <Typography variant="caption" color={theme.colors.warning} style={{ marginLeft: 4 }}>Property Code will be your Login ID</Typography>
            </View>
          </Card>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="Done" variant="outline" onPress={() => router.replace('/(app)/(tabs)')} style={{ flex: 1, marginRight: theme.spacing.sm }} />
            <Button title="Share" leftIcon={<Ionicons name="share-outline" size={18} color={theme.colors.white} />} onPress={() => {}} style={{ flex: 1, marginLeft: theme.spacing.sm }} />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
