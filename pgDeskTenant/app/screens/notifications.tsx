import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Header, Typography, Card } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';
import { useTenant } from '../../src/context/TenantContext';
import { useAnnouncementsByPg } from '../../src/hooks/queries/useAnnouncements';
import { formatDate } from '../../src/utils/formatters';

export default function TenantNotificationsScreen() {
  const theme = useTheme();
  const { propertyId } = useTenant();
  const { data: announcements, isLoading } = useAnnouncementsByPg(propertyId ?? undefined);

  return (
    <ScreenWrapper>
      <Header title="Notifications" />
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          {isLoading ? (
            <Typography variant="body" color={theme.colors.textMuted} align="center" style={{ marginVertical: theme.spacing.xl }}>
              Loading notifications...
            </Typography>
          ) : announcements && announcements.length > 0 ? (
            announcements.map((item) => (
              <Card key={item.id} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                  <Ionicons name="notifications-outline" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Typography variant="title2" color={theme.colors.primary}>{item.title}</Typography>
                </View>
                <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>
                  {item.description}
                </Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  {item.createdAt ? formatDate(item.createdAt) : '-'}
                </Typography>
              </Card>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
              <Ionicons name="notifications-off-outline" size={48} color={theme.colors.border} />
              <Typography variant="body" color={theme.colors.textMuted} style={{ marginTop: theme.spacing.sm }}>
                No notifications yet
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
