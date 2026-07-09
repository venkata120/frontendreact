import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, HeroHeader, Avatar } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useSelectedPg } from '../../../src/context/SelectedPgContext';
import { useManagers } from '../../../src/hooks/queries';

const DEPARTMENTS = ['All workers', 'Management', 'Kitchen'];
const DEPT_ICONS: Record<string, any> = {
  'All workers': 'people',
  'Management': 'briefcase',
  'Kitchen': 'restaurant',
};

export default function ManagerStaffScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const { selectedPg } = useSelectedPg();
  const qc = useQueryClient();
  const [activeDept, setActiveDept] = useState('All workers');
  const [search, setSearch] = useState('');

  const ownerId = selectedPg?.ownerId || user?.ownerId || user?.id;
  const { data: managers, isLoading, refetch: refetchManagers } = useManagers(ownerId);

  useFocusEffect(
    useCallback(() => {
      refetchManagers();
      if (ownerId) {
        qc.refetchQueries({ queryKey: ['managers', ownerId] });
      }
    }, [refetchManagers, qc, ownerId])
  );

  const filtered = managers?.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchesDept = activeDept === 'All workers' || activeDept === 'Management';
    return matchesSearch && matchesDept;
  });

  return (
    <ScreenWrapper edges={["bottom", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroHeader
          avatarUri=""
          avatarName={selectedPg?.name || user?.name}
          onAvatarPress={openDrawer}
          onNotificationPress={() => router.push('/screens/notifications' as any)}
          showCount={false}
          height={220}
        />

        <SearchBar placeholder="Search Workers.." value={search} onChangeText={setSearch} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: theme.spacing.base, paddingBottom: theme.spacing.md }}>
          {DEPARTMENTS.map((dept) => (
            <TouchableOpacity
              key={dept}
              onPress={() => setActiveDept(dept)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: theme.spacing.md,
                paddingVertical: 10,
                borderRadius: theme.radius.full,
                backgroundColor: activeDept === dept ? theme.colors.primary : '#F0F7FF',
                marginRight: theme.spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name={DEPT_ICONS[dept]}
                size={14}
                color={activeDept === dept ? theme.colors.white : theme.colors.primary}
                style={{ marginRight: 6 }}
              />
              <Typography variant="bodyMedium" color={activeDept === dept ? theme.colors.white : theme.colors.text}>
                {dept}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person" size={18} color={theme.colors.text} style={{ marginRight: 6 }} />
              <Typography variant="title1">{activeDept}</Typography>
            </View>
            <Typography variant="title2">{filtered?.length ?? 0}</Typography>
          </View>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading...</Typography>}

          {filtered?.map((member) => (
            <Card key={member.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Avatar uri="" name={member.name} size={56} />
                <View style={{ marginLeft: theme.spacing.md, flex: 1 }}>
                  <Typography variant="title3">{member.name}</Typography>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="call-outline" size={12} color={theme.colors.textMuted} />
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>{member.mobile || '-'}</Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Ionicons name="person-outline" size={12} color={theme.colors.textMuted} />
                    <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>Manager</Typography>
                  </View>
                  <Typography variant="bodyMedium" color={theme.colors.accentPurple} style={{ marginTop: theme.spacing.xs }}>
                    {member.email}
                  </Typography>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success, marginRight: 4 }} />
                    <Typography variant="caption" color={theme.colors.success}>Active</Typography>
                  </View>
                  <TouchableOpacity activeOpacity={0.8}>
                    <Ionicons name="call" size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push('/screens/assign-manager' as any)}
        style={{
          position: 'absolute',
          right: theme.spacing.base,
          bottom: insets.bottom,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          ...theme.shadows.md,
        }}
      >
        <Ionicons name="person-add" size={20} color={theme.colors.white} />
        <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
          Add Staff
        </Typography>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
