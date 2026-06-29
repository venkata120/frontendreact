import { useRouter } from 'expo-router';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, SearchBar } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function DraftsNoticesScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
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
          <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
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

          <View style={{ alignItems: 'center', paddingVertical: theme.spacing['3xl'] }}>
            <Ionicons name="document-text-outline" size={64} color={theme.colors.textMuted} />
            <Typography variant="title1" style={{ marginTop: theme.spacing.lg }}>No Draft Notices</Typography>
            <Typography variant="body" color={theme.colors.textMuted}>Draft notices will appear here.</Typography>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.9}
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
        <Typography variant="bodyMedium" color={theme.colors.white} style={{ marginLeft: 6, fontWeight: '600' }}>Post Notice</Typography>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
