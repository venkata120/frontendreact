import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../Avatar/Avatar';
import { PgSelector } from '../PgSelector/PgSelector';
import { useTheme } from '../../hooks/useTheme';
import { useSelectedPg } from '../../context/SelectedPgContext';
import { useDownloadProfileImage } from '../../hooks/queries';

interface Props {
  imageUri?: string;
  avatarUri?: string;
  avatarName?: string;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  showCount?: boolean;
  height?: number;
}

const DEFAULT_HEADER_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';

export const HeroHeader: React.FC<Props> = ({
  imageUri,
  avatarUri,
  avatarName,
  onAvatarPress,
  onNotificationPress,
  showCount = true,
  height = 260,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { selectedPg, propertyImageUri } = useSelectedPg();

  const { data: pgImage } = useDownloadProfileImage(selectedPg?.id, 'PG', 'profiles', {
    enabled: !!selectedPg?.id && !propertyImageUri && !imageUri,
  });

  const effectiveImageUri = imageUri || propertyImageUri || pgImage?.presignedUrl || DEFAULT_HEADER_IMAGE;
  const [displayUri, setDisplayUri] = useState(effectiveImageUri);

  useEffect(() => {
    setDisplayUri(effectiveImageUri);
  }, [effectiveImageUri]);

  return (
    <View
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderBottomLeftRadius: 48,
        borderBottomRightRadius: 48,
        backgroundColor: theme.colors.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <Image
        source={{ uri: displayUri }}
        style={{ width: '100%', height }}
        resizeMode="cover"
        onError={() => setDisplayUri(DEFAULT_HEADER_IMAGE)}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.22)',
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: insets.top + theme.spacing.md,
          left: theme.spacing.base,
          right: theme.spacing.base,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={0.8} onPress={onAvatarPress}>
            <Avatar size={44} uri={avatarUri} name={avatarName} />
          </TouchableOpacity>
          <View style={{ marginLeft: theme.spacing.sm }}>
            <PgSelector showCount={showCount} />
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNotificationPress}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#FACC15',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="notifications" size={22} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
