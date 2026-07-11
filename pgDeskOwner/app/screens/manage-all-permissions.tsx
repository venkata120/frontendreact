import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper, Typography, Card, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

const PERMISSIONS = [
  { label: 'View tenant contact numbers', description: 'Allow manager to see phone numbers' },
  { label: 'Collect rent payments', description: 'Allow manager to record payments' },
  { label: 'Add new tenants', description: 'Allow manager to onboard tenants' },
  { label: 'Manage room allocations', description: 'Allow manager to assign rooms' },
  { label: 'Post notices', description: 'Allow manager to create notices' },
  { label: 'View financial reports', description: 'Allow manager to see finance data' },
];

const DEFAULT_PERMISSIONS: Record<string, boolean> = {
  'View tenant contact numbers': true,
  'Collect rent payments': false,
  'Add new tenants': true,
  'Manage room allocations': false,
  'Post notices': true,
  'View financial reports': false,
};

const STORAGE_KEY = '@pgdesk/manager-permissions';

export default function ManageAllPermissionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Record<string, boolean>>(DEFAULT_PERMISSIONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setPermissions({ ...DEFAULT_PERMISSIONS, ...JSON.parse(stored) });
        } catch {
          setPermissions(DEFAULT_PERMISSIONS);
        }
      }
      setLoaded(true);
    });
  }, []);

  const toggle = (label: string) => {
    setPermissions((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSave = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
    Alert.alert('Success', 'Permissions saved successfully');
    router.back();
  }, [permissions, router]);

  const handleReset = () => {
    Alert.alert('Reset Permissions', 'Are you sure you want to reset all permissions to default?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => setPermissions(DEFAULT_PERMISSIONS),
      },
    ]);
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: theme.spacing.md }}>
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
                marginRight: theme.spacing.md,
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#0A2A5E" />
            </TouchableOpacity>
            <Typography variant="headline2" color={theme.colors.white} numberOfLines={1} style={{ flexShrink: 1 }}>Manage Permissions</Typography>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleReset}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.danger,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 8,
              borderRadius: theme.radius.md,
              minWidth: 72,
              flexShrink: 0,
            }}
          >
            <Ionicons name="refresh" size={14} color={theme.colors.white} />
            <Typography variant="caption" color={theme.colors.white} style={{ marginLeft: 4, fontWeight: '600' }}>Reset</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base }}>
          <Typography variant="caption" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.md }}>
            Permissions are saved on this device only. They are not enforced by the backend yet.
          </Typography>
          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Manager Controlled</Typography>

          {loaded && PERMISSIONS.map((permission) => (
            <Card key={permission.label} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: theme.spacing.md }}>
                  <Typography variant="bodyMedium">{permission.label}</Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>{permission.description}</Typography>
                </View>
                <Switch
                  value={permissions[permission.label]}
                  onValueChange={() => toggle(permission.label)}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <View style={{ padding: theme.spacing.base }}>
        <Button
          title="Save Changes"
          leftIcon={<Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />}
          onPress={handleSave}
        />
      </View>
    </ScreenWrapper>
  );
}
