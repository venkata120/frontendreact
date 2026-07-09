import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
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
  height = 200,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { selectedPg } = useSelectedPg();

  const { data: pgImage } = useDownloadProfileImage(selectedPg?.id, 'PG', 'profiles', {
    enabled: !!selectedPg?.id && !imageUri,
  });

  const effectiveImageUri = imageUri || pgImage?.presignedUrl || DEFAULT_HEADER_IMAGE;
  const [displayUri, setDisplayUri] = useState(effectiveImageUri);

  useEffect(() => {
    setDisplayUri(effectiveImageUri);
  }, [effectiveImageUri]);

  // Symmetric transition curve: left dips down to the bottom edge,
  // right peaks up into the image, both with the same arc depth.
  const REFERENCE_HEIGHT = 310;
  const scale = height / REFERENCE_HEIGHT;

  const curveDepth = 87 * scale;
  const flatY = height - curveDepth;
  const leftDipY = flatY + curveDepth;
  const rightPeakY = flatY - curveDepth;

  const flatStartX = width * 0.125;
  const flatEndX = width * 0.875;
  const rightC2X = width * 0.92;
  const leftC2X = flatStartX - (width + 40 - rightC2X);

  const buildCardPath = (offsetY = 0) => `
    M -40,${height + 20 + offsetY}
    L -40,${leftDipY + offsetY}
    C -10,${leftDipY + offsetY} ${leftC2X},${flatY + offsetY} ${flatStartX},${flatY + offsetY}
    L ${flatEndX},${flatY + offsetY}
    C ${flatEndX + 30},${flatY + offsetY} ${rightC2X},${rightPeakY + offsetY} ${width + 40},${rightPeakY + offsetY}
    L ${width + 40},${height + 20 + offsetY}
    Z
  `;

  const cardPath = buildCardPath(0);
  const shadowPath = buildCardPath(6);

  return (
    <View
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
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

      {/* Asymmetric white card overlay with subtle drop shadow */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} pointerEvents="none">
        <Svg width={width + 80} height={height + 20} viewBox={`-40 0 ${width + 80} ${height + 20}`} preserveAspectRatio="none">
          <Path d={shadowPath} fill="rgba(0,0,0,0.1)" />
          <Path d={cardPath} fill={theme.colors.background} />
        </Svg>
      </View>

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
