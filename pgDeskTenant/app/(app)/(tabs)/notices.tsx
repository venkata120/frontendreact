import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, SearchBar } from '../../../src/components';
import { useTheme } from '../../../src/hooks/useTheme';

const NOTICES = [
  {
    title: 'Water Supply Interruption',
    date: '14-05-2026',
    description: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance work. Please store water in advance.',
    type: 'Owner Post',
    read: 8,
    total: 24,
  },
  {
    title: 'WiFi Speed Issue',
    date: '15-05-2026',
    description: 'The WiFi speed has been very slow for the past week. Please check with the ISP.',
    type: 'Tenant Post',
    read: 2,
    total: 24,
  },
  {
    title: 'AC Not Working in Room 201',
    date: '18-05-2026',
    description: 'The AC in room 201 has not been working for the past 3 days. Please repair as soon as possible.',
    type: 'Tenant Post',
    read: 0,
    total: 24,
  },
];

export default function NoticesScreen() {
  const theme = useTheme();

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
        <Typography variant="headline2" color={theme.colors.white}>Notice Board</Typography>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -theme.spacing.lg }}>
        <View style={{ paddingHorizontal: theme.spacing.base }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
              <SearchBar placeholder="Search notices..." />
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

          <Typography variant="title1" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>All Notices</Typography>

          {NOTICES.map((notice, index) => (
            <Card key={index} shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FECACA' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
                <Typography variant="title2" color={theme.colors.danger}>{notice.title}</Typography>
                <View style={{ flexDirection: 'row' }}>
                  <Ionicons name="pin" size={18} color={theme.colors.primary} style={{ marginRight: 8 }} />
                  <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <View
                  style={{
                    backgroundColor: notice.type === 'Owner Post' ? theme.colors.primary : theme.colors.secondary,
                    borderRadius: theme.radius.sm,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginRight: 8,
                  }}
                >
                  <Typography variant="caption" color={theme.colors.white}>{notice.type}</Typography>
                </View>
                <Typography variant="caption" color={theme.colors.textMuted}>Visible to: All</Typography>
              </View>

              <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.sm }}>
                {notice.description}
              </Typography>

              <Typography variant="caption" color={theme.colors.textMuted} style={{ marginBottom: theme.spacing.sm }}>
                Posted: {notice.date}
              </Typography>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                <View style={{ flex: 1, height: 6, backgroundColor: theme.colors.borderLight, borderRadius: 3, marginRight: theme.spacing.sm }}>
                  <View style={{ width: `${(notice.read / notice.total) * 100}%`, height: 6, backgroundColor: theme.colors.success, borderRadius: 3 }} />
                </View>
                <Typography variant="caption" color={theme.colors.textMuted}>{notice.read}/{notice.total} read</Typography>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  backgroundColor: theme.colors.success,
                  borderRadius: theme.radius.md,
                  paddingVertical: theme.spacing.sm,
                  alignItems: 'center',
                }}
              >
                <Typography variant="bodyMedium" color={theme.colors.white} style={{ fontWeight: '600' }}>Mark as Read</Typography>
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
