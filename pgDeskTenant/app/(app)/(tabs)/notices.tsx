import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';
import { useTenant } from '../../../src/context/TenantContext';
import { useNotices, useArchiveNotice } from '../../../src/hooks/queries/useNotices';
import { formatDate } from '../../../src/utils/formatters';
import { Storage } from '../../../src/services/storage';
import type { NoticeBoard, NoticeType } from '../../../src/types';

const NOTICE_TYPES: NoticeType[] = [
  'NOTICE',
  'ANNOUNCEMENT',
  'INFORMATION',
  'COMPLAINT',
  'REQUEST',
  'REMINDER',
  'MAINTENANCE',
  'EVENT',
  'OTHER',
];

const NOTICE_TYPE_LABELS: Record<NoticeType, string> = {
  NOTICE: 'Notice',
  ANNOUNCEMENT: 'Announcement',
  INFORMATION: 'Information',
  COMPLAINT: 'Complaint',
  REQUEST: 'Request',
  REMINDER: 'Reminder',
  MAINTENANCE: 'Maintenance',
  EVENT: 'Event',
  OTHER: 'Other',
};

export default function NoticesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { propertyId } = useTenant();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NoticeType | 'ALL'>('ALL');
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<number>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      const savedRead = await Storage.getObject<number[]>('tenant_notice_read_ids');
      const savedPinned = await Storage.getObject<number[]>('tenant_notice_pinned_ids');
      if (!mounted) return;
      if (savedRead) setReadIds(new Set(savedRead));
      if (savedPinned) setPinnedIds(new Set(savedPinned));
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    Storage.setObject('tenant_notice_read_ids', Array.from(readIds));
  }, [readIds]);

  useEffect(() => {
    Storage.setObject('tenant_notice_pinned_ids', Array.from(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const searchPayload = useMemo(
    () =>
      propertyId
        ? {
            propertyId,
            audienceType: 'ALL_TENANTS' as const,
            status: 'ACTIVE' as const,
            noticeType: typeFilter !== 'ALL' ? typeFilter : undefined,
            title: debouncedSearch.trim() || undefined,
            size: 50,
            sortDirection: 'DESC' as const,
          }
        : undefined,
    [propertyId, typeFilter, debouncedSearch]
  );

  const { data: noticesResponse, isLoading, refetch } = useNotices(searchPayload);
  const archiveNotice = useArchiveNotice();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = (noticesResponse?.notices || [])
      .filter((n) => !deletedIds.has(n.id))
      .filter((n) => typeFilter === 'ALL' || n.noticeType === typeFilter)
      .filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.senderType.toLowerCase().includes(q)
      );
    return [
      ...result.filter((n) => pinnedIds.has(n.id)),
      ...result.filter((n) => !pinnedIds.has(n.id)),
    ];
  }, [noticesResponse, deletedIds, pinnedIds, typeFilter, search]);

  const toggleRead = (notice: NoticeBoard) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(notice.id)) next.delete(notice.id);
      else next.add(notice.id);
      return next;
    });
  };

  const togglePin = (notice: NoticeBoard) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(notice.id)) next.delete(notice.id);
      else next.add(notice.id);
      return next;
    });
  };

  const confirmDelete = (notice: NoticeBoard) => {
    Alert.alert('Delete Notice', `Are you sure you want to remove "${notice.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletedIds((prev) => new Set(prev).add(notice.id));
            await archiveNotice.mutateAsync(notice.id);
            refetch();
          } catch (err: any) {
            setDeletedIds((prev) => {
              const next = new Set(prev);
              next.delete(notice.id);
              return next;
            });
            Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to delete notice');
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.navigate('/(app)/(tabs)')}
            style={{ marginRight: theme.spacing.sm }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Typography variant="headline2" color={theme.colors.white}>Notice Board</Typography>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xl }}
      >
        <View style={{ paddingHorizontal: theme.spacing.base, paddingTop: theme.spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search notices..." value={search} onChangeText={setSearch} />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setFilterOpen(true)}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: typeFilter !== 'ALL' ? theme.colors.primarySurface : theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: typeFilter !== 'ALL' ? theme.colors.primary : theme.colors.border,
              }}
            >
              <Ionicons name="options-outline" size={22} color={typeFilter !== 'ALL' ? theme.colors.primary : theme.colors.text} />
            </TouchableOpacity>
          </View>

          <Typography variant="title1" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>All Notices</Typography>

          {isLoading ? (
            <ActivityIndicator />
          ) : filtered.length === 0 ? (
            <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginVertical: theme.spacing.lg }}>
              {search.trim() || typeFilter !== 'ALL' ? 'No notices match your search.' : 'No notices found'}
            </Typography>
          ) : (
            filtered.map((notice) => {
              const isRead = readIds.has(notice.id);
              const isPinned = pinnedIds.has(notice.id);
              return (
                <Card
                  key={String(notice.id)}
                  shadow="sm"
                  padding={theme.spacing.md}
                  style={{
                    marginBottom: theme.spacing.md,
                    backgroundColor: isPinned ? '#FFFBEB' : isRead ? theme.colors.backgroundSecondary : theme.colors.white,
                    borderWidth: isPinned ? 1 : 0,
                    borderColor: '#FDE68A',
                    opacity: isRead ? 0.85 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                    <Typography variant="title2" color={theme.colors.text} style={{ flex: 1, marginRight: theme.spacing.sm }}>
                      {notice.title}
                    </Typography>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => togglePin(notice)} style={{ marginRight: 8 }}>
                        <Ionicons name={isPinned ? 'pin' : 'pin-outline'} size={18} color={theme.colors.primary} />
                      </TouchableOpacity>
                      {notice.senderType === 'TENANT' && (
                        <TouchableOpacity onPress={() => confirmDelete(notice)}>
                          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <View
                      style={{
                        backgroundColor: notice.senderType === 'OWNER' ? theme.colors.primary : theme.colors.secondary,
                        borderRadius: theme.radius.sm,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginRight: 8,
                      }}
                    >
                      <Typography variant="caption" color={theme.colors.white}>{NOTICE_TYPE_LABELS[notice.noticeType]}</Typography>
                    </View>
                    <Typography variant="caption" color={theme.colors.textMuted}>Visible to: {notice.audienceType.replace(/_/g, ' ')}</Typography>
                  </View>

                  <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>
                    {notice.description}
                  </Typography>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      Posted: {notice.createdDate ? formatDate(notice.createdDate) : '-'}
                    </Typography>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => toggleRead(notice)}
                      style={{
                        backgroundColor: isRead ? theme.colors.successSurface : theme.colors.primarySurface,
                        borderRadius: theme.radius.full,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                      }}
                    >
                      <Typography variant="caption" color={isRead ? theme.colors.success : theme.colors.primary} style={{ fontWeight: '600' }}>
                        {isRead ? 'Read' : 'Mark as Read'}
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal visible={filterOpen} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setFilterOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.lg, paddingBottom: theme.spacing.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <Typography variant="title2" style={{ fontWeight: '600' }}>Filter by Type</Typography>
              <TouchableOpacity onPress={() => setFilterOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            {(['ALL', ...NOTICE_TYPES] as (NoticeType | 'ALL')[]).map((type) => {
              const selected = typeFilter === type;
              return (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.8}
                  onPress={() => {
                    setTypeFilter(type);
                    setFilterOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <Typography variant="bodyMedium" color={selected ? theme.colors.primary : theme.colors.text}>
                    {type === 'ALL' ? 'All Types' : NOTICE_TYPE_LABELS[type]}
                  </Typography>
                  {selected && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
