import { useRouter } from 'expo-router';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  ScreenWrapper,
  Header,
  Typography,
  Card,
  Avatar,
  Button,
  Input,
} from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/hooks/useAuth';
import { useSelectedPg } from '../../src/context/SelectedPgContext';
import { useNotices, useCreateNotice, useArchiveNotice } from '../../src/hooks/queries';
import type { NoticeBoard, NoticeType } from '../../src/types';

const NOTICE_ACTIONS: Record<
  NoticeType,
  { primary: { label: string; icon: any }; secondary: { label: string; icon: any } }
> = {
  REQUEST: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Approve', icon: 'checkmark-circle' },
  },
  NOTICE: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
  ANNOUNCEMENT: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
  INFORMATION: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
  COMPLAINT: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
  REMINDER: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
  MAINTENANCE: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
  EVENT: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
  OTHER: {
    primary: { label: 'View', icon: 'eye' },
    secondary: { label: 'Archive', icon: 'archive' },
  },
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPg } = useSelectedPg();

  const searchPayload = useMemo(
    () =>
      selectedPg?.id
        ? {
            propertyId: selectedPg.id,
            status: 'ACTIVE' as const,
            sortBy: 'createdDate',
            sortDirection: 'DESC' as const,
            size: 50,
          }
        : undefined,
    [selectedPg?.id]
  );

  const { data, isLoading, error, refetch } = useNotices(searchPayload);
  const createNotice = useCreateNotice();
  const archiveNotice = useArchiveNotice();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const notices = data?.notices || [];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFormError('');
  };

  const senderType = user?.role === 'manager' ? 'MANAGER' : 'OWNER';

  const handleCreateNotice = async () => {
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    if (!selectedPg?.id || !user?.id) {
      setFormError('Property or user not selected');
      return;
    }

    try {
      await createNotice.mutateAsync({
        propertyId: selectedPg.id,
        title: title.trim(),
        description: description.trim(),
        noticeType: 'NOTICE',
        senderType,
        senderId: user.id,
        audienceType: 'ALL_TENANTS',
        priority: 'NORMAL',
        status: 'ACTIVE',
      });

      resetForm();
      setModalVisible(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to create notice';
      setFormError(message);
    }
  };

  const handleView = (notice: NoticeBoard) => {
    Alert.alert(notice.title, notice.description, [{ text: 'OK' }]);
  };

  const handleSecondaryAction = (notice: NoticeBoard) => {
    if (notice.noticeType === 'REQUEST') {
      Alert.alert('Approve', `Approve request: ${notice.title}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () =>
            archiveNotice.mutate(notice.id, {
              onSuccess: () => Alert.alert('Approved', 'The request has been approved.'),
            }),
        },
      ]);
    } else {
      archiveNotice.mutate(notice.id);
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title="Notifications"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)'))}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: theme.spacing.base, paddingBottom: theme.spacing['3xl'] }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.warning,
              marginRight: theme.spacing.sm,
            }}
          />
          <Typography variant="title1">Today</Typography>
        </View>

        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
        ) : error ? (
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing.xl }}>
            <Ionicons name="alert-circle-outline" size={40} color={theme.colors.danger} />
            <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
              Failed to load notifications
            </Typography>
            <TouchableOpacity onPress={() => refetch()} style={{ marginTop: theme.spacing.md }}>
              <Typography variant="bodyMedium" color={theme.colors.primary}>
                Retry
              </Typography>
            </TouchableOpacity>
          </View>
        ) : notices.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.border} />
            <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.md }}>
              No notifications yet
            </Typography>
          </View>
        ) : (
          notices.map((notice) => {
            const actions = NOTICE_ACTIONS[notice.noticeType] || NOTICE_ACTIONS.NOTICE;
            const senderName = notice.senderType === 'OWNER' ? user?.name || 'Owner' : 'PG Desk';
            const isRequest = notice.noticeType === 'REQUEST';
            return (
              <Card
                key={notice.id}
                shadow="sm"
                padding={theme.spacing.base}
                style={{
                  marginBottom: theme.spacing.md,
                  backgroundColor: theme.colors.card,
                  borderWidth: 1,
                  borderColor: isRequest ? theme.colors.warning : theme.colors.border,
                }}
              >
                {/* Header row: title + optional tag */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <Typography
                    variant="bodyMedium"
                    style={{ flex: 1, marginRight: theme.spacing.sm, fontWeight: '600' }}
                  >
                    {notice.title}
                  </Typography>
                  {isRequest && (
                    <Typography variant="caption" color={theme.colors.warning}>
                      New Request
                    </Typography>
                  )}
                </View>

                {/* Avatar + message */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
                  <Avatar uri="" name={senderName} size={48} />
                  <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
                    <Typography variant="title3">{senderName}</Typography>
                    <Typography variant="body" color={theme.colors.textMuted}>
                      {notice.description.length > 80
                        ? `${notice.description.slice(0, 80)}...`
                        : notice.description}
                    </Typography>
                    {notice.createdDate && (
                      <Typography variant="caption" color={theme.colors.textMuted}>
                        {formatDate(notice.createdDate)}
                      </Typography>
                    )}
                  </View>
                </View>

                {/* Action buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button
                    title={actions.secondary.label}
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    leftIcon={
                      <Ionicons
                        name={actions.secondary.icon}
                        size={16}
                        color={isRequest ? theme.colors.primary : theme.colors.text}
                      />
                    }
                    textColor={isRequest ? theme.colors.primary : theme.colors.text}
                    style={{
                      flex: 1,
                      marginRight: theme.spacing.sm,
                      borderColor: isRequest ? theme.colors.primary : theme.colors.border,
                    }}
                    onPress={() => handleSecondaryAction(notice)}
                    loading={archiveNotice.isPending}
                  />
                  <Button
                    title={actions.primary.label}
                    size="sm"
                    fullWidth={false}
                    leftIcon={<Ionicons name={actions.primary.icon} size={16} color={theme.colors.white} />}
                    style={{ flex: 1, marginLeft: theme.spacing.sm }}
                    onPress={() => handleView(notice)}
                  />
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          right: theme.spacing.base,
          bottom: theme.spacing.base,
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
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: theme.colors.overlay,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius['2xl'],
              borderTopRightRadius: theme.radius['2xl'],
              padding: theme.spacing.base,
              paddingBottom: theme.spacing['2xl'],
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: theme.spacing.md,
              }}
            >
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

            <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm }}>
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
                <Button
                  title="Post"
                  loading={createNotice.isPending}
                  disabled={createNotice.isPending}
                  onPress={handleCreateNotice}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
