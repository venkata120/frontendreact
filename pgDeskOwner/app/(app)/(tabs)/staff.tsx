import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar, HeroHeader, Avatar } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useDrawer } from '../../../src/context/DrawerContext';
import { useManagers, useDeleteManager } from '../../../src/hooks/queries';

const DEPARTMENTS = ['All workers', 'Management', 'Kitchen'];
const DEPT_ICONS: Record<string, any> = {
  'All workers': 'people',
  'Management': 'briefcase',
  'Kitchen': 'restaurant',
};

export default function StaffScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const qc = useQueryClient();
  const [activeDept, setActiveDept] = useState('All workers');
  const [search, setSearch] = useState('');

  const { data: managers, isLoading, refetch: refetchManagers } = useManagers(user?.id);
  const deleteManager = useDeleteManager();

  useFocusEffect(
    useCallback(() => {
      refetchManagers();
      if (user?.id) {
        qc.refetchQueries({ queryKey: ['managers', user.id] });
      }
    }, [refetchManagers, qc, user?.id])
  );

  const filtered = managers?.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    const matchesDept = activeDept === 'All workers' || activeDept === 'Management';
    return matchesSearch && matchesDept;
  });

  const handleCall = async (phone?: string) => {
    if (!phone) {
      Alert.alert('No phone number', 'This staff member does not have a phone number.');
      return;
    }
    const url = `tel:${phone}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open phone dialer');
    }
  };

  return (
    <ScreenWrapper edges={["bottom", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroHeader
          avatarUri=""
          avatarName={user?.name}
          onAvatarPress={openDrawer}
          onNotificationPress={() => router.push('/screens/notifications' as any)}
          showCount={true}
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
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/screens/manager-profile' as any, params: { managerId: member.id } })}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                >
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
                </TouchableOpacity>

                <View style={{ alignItems: 'flex-end', marginLeft: theme.spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: member.active ? theme.colors.success : theme.colors.textMuted, marginRight: 4 }} />
                    <Typography variant="caption" color={member.active ? theme.colors.success : theme.colors.textMuted}>{member.active ? 'Active' : 'Inactive'}</Typography>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: '/screens/edit-manager' as any, params: { id: member.id } })}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: theme.colors.successSurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: theme.spacing.sm,
                      }}
                    >
                      <Ionicons name="create-outline" size={16} color={theme.colors.success} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        Alert.alert(
                          'Delete Staff',
                          `Are you sure you want to remove ${member.name}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => member.id && deleteManager.mutate(member.id),
                            },
                          ]
                        );
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: theme.colors.dangerSurface,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleCall(member.mobile)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.colors.primarySurface,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="call" size={16} color={theme.colors.primary} />
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
        onPress={() => router.push('/screens/assign-manager')}
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
