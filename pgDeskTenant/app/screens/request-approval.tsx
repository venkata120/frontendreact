import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper, Typography, Card, Button } from '../../src/components';
import { useTheme } from '../../src/hooks/useTheme';

export default function RequestApprovalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: theme.spacing.base, paddingTop: theme.spacing['3xl'] }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2558/2558944.png' }}
              style={{ width: 100, height: 100 }}
              resizeMode="contain"
            />
            <Typography variant="headline2" style={{ marginTop: theme.spacing.md }}>Request Approved !</Typography>
            <Typography variant="body" color={theme.colors.textMuted} align="center">Owner has accepted your shifting room request</Typography>
          </View>

          <Card shadow="sm" padding={theme.spacing.md} style={{ backgroundColor: theme.colors.primarySurface, marginBottom: theme.spacing.md }}>
            <Typography variant="title1" align="center">Srinivas Rao mens pg</Typography>
            <Typography variant="caption" color={theme.colors.textMuted} align="center">Road no.5, vijay nagar colony, miyapur, hyderabad</Typography>
          </Card>

          <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
              <Typography variant="bodyMedium" color={theme.colors.textMuted}>Previous Room</Typography>
              <Typography variant="bodyMedium" color={theme.colors.primary}>Present Room</Typography>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, borderRightWidth: 1, borderRightColor: theme.colors.borderLight, paddingRight: theme.spacing.md }}>
                {[
                  { label: 'Room', value: '102', icon: 'bed-outline' },
                  { label: 'Floor', value: '01', icon: 'trail-sign-outline' },
                  { label: 'Sharing', value: '03', icon: 'people-outline' },
                ].map((item) => (
                  <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={item.icon as any} size={16} color={theme.colors.textMuted} />
                      <Typography variant="caption" color={theme.colors.textMuted} style={{ marginLeft: 4 }}>{item.label}</Typography>
                    </View>
                    <Typography variant="bodyMedium">{item.value}</Typography>
                  </View>
                ))}
              </View>
              <View style={{ flex: 1, paddingLeft: theme.spacing.md }}>
                {[
                  { label: 'Room', value: '105', icon: 'bed-outline' },
                  { label: 'Floor', value: '02', icon: 'trail-sign-outline' },
                  { label: 'Sharing', value: '03', icon: 'people-outline' },
                ].map((item) => (
                  <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name={item.icon as any} size={16} color={theme.colors.primary} />
                      <Typography variant="caption" color={theme.colors.primary} style={{ marginLeft: 4 }}>{item.label}</Typography>
                    </View>
                    <Typography variant="bodyMedium">{item.value}</Typography>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          <Typography variant="title1" style={{ marginBottom: theme.spacing.md }}>Payment Details</Typography>
          <Card shadow="sm" padding={theme.spacing.md} style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }}>
              <Typography variant="body" color={theme.colors.textMuted}>Monthly Rent :</Typography>
              <Typography variant="bodyMedium">₹10500</Typography>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm }}>
              <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '600' }}>Total to Pay :</Typography>
              <Typography variant="bodyMedium" color={theme.colors.primary} style={{ fontWeight: '600' }}>₹10500</Typography>
            </View>
          </Card>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg }}
          >
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={20} color={theme.colors.primary} />
            <Typography variant="body" style={{ marginLeft: 8 }}>I agree to the <Typography variant="bodyMedium" color={theme.colors.primary}>Terms & Conditions</Typography></Typography>
          </TouchableOpacity>

          <Button title="Accept & Proceed Payment" disabled={!agreed} onPress={() => router.push('/(app)/pending-dues' as any)} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
