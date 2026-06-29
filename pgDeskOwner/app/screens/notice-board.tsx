import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ScreenWrapper,
  Header,
  Typography,
  Card,
  SearchBar,
  Input,
  Button,
  DatePicker,
  PgSelector,
} from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useNotices, useCreateNotice, useArchiveNotice } from '../../src/hooks/queries';
import dayjs from 'dayjs';
import type {
  NoticeBoard,
  NoticeType,
  AudienceType,
  NoticePriority,
} from '../../src/types';

const NOTICE_TYPE_OPTIONS: { label: string; value: NoticeType }[] = [
  { label: 'Notice', value: 'NOTICE' },
  { label: 'Announcement', value: 'ANNOUNCEMENT' },
  { label: 'Information', value: 'INFORMATION' },
  { label: 'Complaint', value: 'COMPLAINT' },
  { label: 'Request', value: 'REQUEST' },
  { label: 'Reminder', value: 'REMINDER' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Event', value: 'EVENT' },
  { label: 'Other', value: 'OTHER' },
];

const AUDIENCE_OPTIONS: { label: string; value: AudienceType }[] = [
  { label: 'All Tenants', value: 'ALL_TENANTS' },
  { label: 'Specific Tenants', value: 'SPECIFIC_TENANTS' },
  { label: 'Owner', value: 'OWNER' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Owner & Manager', value: 'OWNER_AND_MANAGER' },
];

const PRIORITY_OPTIONS: { label: string; value: NoticePriority; color: string }[] = [
  { label: 'Low', value: 'LOW', color: '#6B7280' },
  { label: 'Normal', value: 'NORMAL', color: '#3B82F6' },
  { label: 'High', value: 'HIGH', color: '#F59E0B' },
  { label: 'Urgent', value: 'URGENT', color: '#EF4444' },
];

const SENDER_LABELS: Record<string, string> = {
  OWNER: 'Owner Post',
  MANAGER: 'Manager Post',
  TENANT: 'Tenant Post',
  SYSTEM: 'System Post',
};

const AUDIENCE_LABELS: Record<string, string> = {
  ALL_TENANTS: 'All',
  SPECIFIC_TENANTS: 'Specific Tenants',
  OWNER: 'Owner Only',
  MANAGER: 'Manager Only',
  OWNER_AND_MANAGER: 'Owner & Manager',
};

export default function NoticeBoardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPg } = useSelectedPg();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [noticeType, setNoticeType] = useState<NoticeType>('NOTICE');
  const [audienceType, setAudienceType] = useState<AudienceType>('ALL_TENANTS');
  const [priority, setPriority] = useState<NoticePriority>('NORMAL');
  const [publishFrom, setPublishFrom] = useState<string>('');
  const [publishTill, setPublishTill] = useState<string>('');
  const [formError, setFormError] = useState('');
  const [dateField, setDateField] = useState<'publishFrom' | 'publishTill' | null>(null);

  const searchPayload = useMemo(
    () =>
      selectedPg?.id
        ? {
            propertyId: selectedPg.id,
            sortBy: 'createdDate',
            sortDirection: 'DESC' as const,
            size: 50,
          }
        : undefined,
    [selectedPg?.id]
  );

  const { data, isLoading } = useNotices(searchPayload);
  const createNotice = useCreateNotice();
  const archiveNotice = useArchiveNotice();

  const notices = useMemo(() => data?.notices || [], [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return notices;
    const q = search.toLowerCase();
    return notices.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.noticeType.toLowerCase().includes(q)
    );
  }, [notices, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const published = filtered.filter((n) => n.status === 'ACTIVE').length;
    const tenantPosts = filtered.filter((n) => n.senderType === 'TENANT').length;
    const drafts = filtered.filter((n) => n.status === 'CLOSED').length;
    const scheduled = filtered.filter(
      (n) => n.publishFrom && dayjs(n.publishFrom).isAfter(dayjs())
    ).length;
    const pinned = 0;
    return [
      { label: 'Total', value: total, icon: 'notifications', color: '#A855F7' },
      { label: 'Published', value: published, icon: 'paper-plane', color: '#22C55E' },
      { label: 'Tenant posts', value: tenantPosts, icon: 'people', color: '#3B82F6' },
      { label: 'Drafts', value: drafts, icon: 'document-text', color: '#6B7280' },
      { label: 'Schedule', value: scheduled, icon: 'time', color: '#F59E0B' },
      { label: 'Pinned', value: pinned, icon: 'star', color: '#EF4444' },
    ];
  }, [filtered]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setNoticeType('NOTICE');
    setAudienceType('ALL_TENANTS');
    setPriority('NORMAL');
    setPublishFrom('');
    setPublishTill('');
    setFormError('');
  };

  const handleCreateNotice = async () => {
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    if (!selectedPg?.id || !user?.id) {
      setFormError('Property or user not selected');
      return;
    }

    const senderType = user.role === 'manager' ? 'MANAGER' : 'OWNER';

    try {
      await createNotice.mutateAsync({
        propertyId: selectedPg.id,
        title: title.trim(),
        description: description.trim(),
        noticeType,
        senderType,
        senderId: user.id,
        audienceType,
        priority,
        status: 'ACTIVE',
        publishFrom: publishFrom || undefined,
        publishTill: publishTill || undefined,
      });

      resetForm();
      setModalVisible(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create notice';
      setFormError(message);
    }
  };

  const handleDelete = (notice: NoticeBoard) => {
    Alert.alert('Delete Notice', `Delete "${notice.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => archiveNotice.mutate(notice.id),
      },
    ]);
  };

  const renderOptionButton = <T extends string>(
    options: { label: string; value: T; color?: string }[],
    selected: T,
    onSelect: (value: T) => void
  ) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: theme.spacing.sm }}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.8}
            onPress={() => onSelect(opt.value)}
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.full,
              backgroundColor: active ? opt.color || theme.colors.primary : theme.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: active ? opt.color || theme.colors.primary : theme.colors.border,
            }}
          >
            <Typography variant="caption" color={active ? theme.colors.white : theme.colors.text}>
              {opt.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderDateField = (
    label: string,
    value: string,
    field: 'publishFrom' | 'publishTill',
    error?: string
  ) => (
    <View style={{ marginTop: theme.spacing.md }}>
      <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginBottom: theme.spacing.xs }}>
        {label}
      </Typography>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setDateField(field)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: error ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.backgroundSecondary,
        }}
      >
        <Ionicons name="calendar" size={18} color={theme.colors.primary} />
        <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginLeft: theme.spacing.sm, flex: 1 }}>
          {value ? dayjs(value).format('DD MMM YYYY') : `Select ${label.toLowerCase()}`}
        </Typography>
        <Ionicons name="chevron-down" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenWrapper>
      <Header
        title="Notice Board"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
        rightAction={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PgSelector />
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#F6F6F6',
                borderRadius: theme.radius.full,
                padding: 4,
                marginLeft: theme.spacing.sm,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: theme.radius.full,
                  backgroundColor: theme.colors.success,
                }}
              >
                <Ionicons name="newspaper" size={14} color={theme.colors.white} />
                <Typography variant="caption" color={theme.colors.white} style={{ marginLeft: 4, fontWeight: '500' }}>
                  Notices
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/screens/food-menu' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.radius.full }}
              >
                <Ionicons name="restaurant-outline" size={14} color={theme.colors.warning} />
                <Typography variant="caption" color={theme.colors.warning} style={{ marginLeft: 4, fontWeight: '500' }}>
                  Food Menu
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search notices..." value={search} onChangeText={setSearch} />
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radius.md,
                backgroundColor: theme.colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Ionicons name="options-outline" size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginVertical: theme.spacing.md }}>
            {stats.map((stat) => (
              <Card key={stat.label} shadow="sm" padding={theme.spacing.sm} style={{ width: 80, marginRight: theme.spacing.sm, alignItems: 'center' }}>
                <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                <Typography variant="title2" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color={theme.colors.textMuted} style={{ textAlign: 'center' }}>
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </ScrollView>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>
            All Notices
          </Typography>

          {isLoading && <Typography variant="body" color={theme.colors.textMuted}>Loading notices...</Typography>}

          {!isLoading && filtered.length > 0 ? (
            filtered.map((notice) => {
              const senderLabel = SENDER_LABELS[notice.senderType] || 'Post';
              const audienceLabel = AUDIENCE_LABELS[notice.audienceType] || 'All';
              const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === notice.priority);
              const isPending = notice.status === 'ACTIVE' && (!notice.publishFrom || !dayjs(notice.publishFrom).isAfter(dayjs()));
              const readCount = 0;
              const totalRecipients = 24;
              const readPercent = Math.round((readCount / totalRecipients) * 100);

              return (
                <Card
                  key={notice.id}
                  shadow="sm"
                  padding={theme.spacing.md}
                  style={{
                    marginBottom: theme.spacing.md,
                    backgroundColor: notice.senderType === 'TENANT' ? '#FEF2F2' : '#FFFBEB',
                    borderWidth: 1,
                    borderColor: notice.senderType === 'TENANT' ? '#FECACA' : '#FDE68A',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                    <Typography variant="title2" color={theme.colors.danger} style={{ flex: 1, marginRight: theme.spacing.sm }}>
                      {notice.title}
                    </Typography>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity style={{ marginRight: 8 }}>
                        <Ionicons name="pin" size={18} color={theme.colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(notice)}>
                        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm, flexWrap: 'wrap' }}>
                    <View
                      style={{
                        backgroundColor: notice.senderType === 'TENANT' ? theme.colors.danger : theme.colors.primary,
                        borderRadius: theme.radius.sm,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginRight: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="person" size={10} color={theme.colors.white} style={{ marginRight: 4 }} />
                      <Typography variant="caption" color={theme.colors.white}>
                        {senderLabel}
                      </Typography>
                    </View>
                    <View
                      style={{
                        backgroundColor: theme.colors.primarySurface,
                        borderRadius: theme.radius.sm,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        marginRight: 8,
                      }}
                    >
                      <Typography variant="caption" color={theme.colors.primary}>
                        Visible to: {audienceLabel}
                      </Typography>
                    </View>
                    {isPending && (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time-outline" size={14} color={theme.colors.warning} style={{ marginRight: 2 }} />
                        <Typography variant="caption" color={theme.colors.warning}>
                          Pending
                        </Typography>
                      </View>
                    )}
                  </View>

                  <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>
                    {notice.description}
                  </Typography>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <Typography variant="caption" color={theme.colors.textMuted}>
                      Posted: {notice.createdDate ? dayjs(notice.createdDate).format('DD-MM-YYYY') : '-'}
                    </Typography>
                    <View
                      style={{
                        marginLeft: theme.spacing.sm,
                        backgroundColor: priorityMeta?.color + '20',
                        borderRadius: theme.radius.sm,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Typography variant="caption" color={priorityMeta?.color} style={{ fontWeight: '600' }}>
                        {notice.priority}
                      </Typography>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                    <View
                      style={{
                        flex: 1,
                        height: 6,
                        backgroundColor: theme.colors.border,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          width: `${readPercent}%`,
                          height: '100%',
                          backgroundColor: theme.colors.success,
                        }}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: theme.spacing.sm }}>
                      <Ionicons name="people" size={14} color={theme.colors.textMuted} />
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>
                        {readCount}/{totalRecipients} read ({readPercent}%)
                      </Typography>
                    </View>
                  </View>
                </Card>
              );
            })
          ) : !isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <Ionicons name="newspaper-outline" size={48} color={theme.colors.border} />
              <Typography variant="body" color={theme.colors.textMuted}>
                No notices yet
              </Typography>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          right: theme.spacing.base,
          bottom: insets.bottom + theme.spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radius.full,
          ...theme.shadows.md,
        }}
      >
        <Ionicons name="add" size={22} color={theme.colors.white} />
        <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>
          Post Notice
        </Typography>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          resetForm();
          setModalVisible(false);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius['2xl'],
              borderTopRightRadius: theme.radius['2xl'],
              padding: theme.spacing.base,
              paddingBottom: theme.spacing['2xl'],
              maxHeight: '92%',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <Typography variant="headline2">Post Notice</Typography>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Title"
                placeholder="Enter notice title"
                value={title}
                onChangeText={setTitle}
                error={formError && !title.trim() ? 'Title is required' : undefined}
              />
              <Input
                label="Description"
                placeholder="Enter notice description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                error={formError && !description.trim() ? 'Description is required' : undefined}
              />

              <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                Notice Type
              </Typography>
              {renderOptionButton(NOTICE_TYPE_OPTIONS, noticeType, (value) => setNoticeType(value as NoticeType))}

              <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                Audience
              </Typography>
              {renderOptionButton(AUDIENCE_OPTIONS, audienceType, (value) => setAudienceType(value as AudienceType))}

              <Typography variant="bodyMedium" color={theme.colors.text} style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.xs }}>
                Priority
              </Typography>
              {renderOptionButton(PRIORITY_OPTIONS, priority, (value) => setPriority(value as NoticePriority))}

              {renderDateField('Publish From', publishFrom, 'publishFrom')}
              {renderDateField('Publish Till', publishTill, 'publishTill')}

              {formError ? (
                <Typography variant="caption" color={theme.colors.danger} style={{ marginTop: theme.spacing.sm }}>
                  {formError}
                </Typography>
              ) : null}

              <View style={{ flexDirection: 'row', marginTop: theme.spacing.lg }}>
                <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => {
                      resetForm();
                      setModalVisible(false);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="Post" loading={createNotice.isPending} disabled={createNotice.isPending} onPress={handleCreateNotice} />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <DatePicker
        visible={dateField === 'publishFrom'}
        value={publishFrom || undefined}
        onChange={(date) => setPublishFrom(dayjs(date).format('YYYY-MM-DD'))}
        onClose={() => setDateField(null)}
        title="Publish From"
      />
      <DatePicker
        visible={dateField === 'publishTill'}
        value={publishTill || undefined}
        onChange={(date) => setPublishTill(dayjs(date).format('YYYY-MM-DD'))}
        onClose={() => setDateField(null)}
        title="Publish Till"
      />
    </ScreenWrapper>
  );
}
