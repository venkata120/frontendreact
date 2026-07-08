import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Alert, ViewStyle } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../Avatar/Avatar';
import { useTheme } from '../../hooks/useTheme';
import { useUploadProfileImage, useDownloadProfileImage } from '../../hooks/queries';
import { getApiErrorMessage } from '../../utils/validation';
import type { ProfileType, ProfileUploadResponse } from '../../types';

export interface ProfileImagePickerRef {
  pickImage: () => void;
}

interface Props {
  uri?: string;
  name?: string;
  size?: number;
  profileType: ProfileType;
  entityId?: string;
  folder?: string;
  style?: ViewStyle;
  onUploaded?: (result: ProfileUploadResponse) => void;
  onError?: (error: Error) => void;
}

export const ProfileImagePicker = forwardRef<ProfileImagePickerRef, Props>(({
  uri,
  name,
  size = 90,
  profileType,
  entityId,
  folder = 'profiles',
  style,
  onUploaded,
  onError,
}, ref) => {
  const theme = useTheme();
  const upload = useUploadProfileImage();
  const download = useDownloadProfileImage(entityId, profileType, folder, { enabled: !uri });
  const [pendingUri, setPendingUri] = useState<string | undefined>(uri);
  const pickImageRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (uri) {
      setPendingUri(uri);
    } else if (download.data?.presignedUrl) {
      setPendingUri(download.data.presignedUrl);
    }
  }, [uri, download.data?.presignedUrl]);

  const isUploading = upload.isPending;

  const pickImage = async () => {
    if (!entityId) {
      Alert.alert('Error', 'Entity ID is missing. Cannot upload profile photo.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to photos to upload a profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setPendingUri(asset.uri);

      const file = {
        uri: asset.uri,
        name: asset.fileName || 'profile.jpg',
        type: asset.mimeType || 'image/jpeg',
      };

      const response = await upload.mutateAsync({
        file,
        profileType,
        entityId,
        folder,
      });

      setPendingUri(response.objectUrl);
      onUploaded?.(response);
    } catch (err: any) {
      setPendingUri(uri);
      const message = getApiErrorMessage(err, 'Failed to upload profile image');
      Alert.alert('Upload failed', message);
      onError?.(err);
    }
  };

  pickImageRef.current = pickImage;
  useImperativeHandle(ref, () => ({
    pickImage: () => pickImageRef.current?.(),
  }));

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={pickImage}
        disabled={isUploading}
        style={{ position: 'relative' }}
      >
        <Avatar size={size} uri={pendingUri} name={name} />

        {isUploading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator color={theme.colors.white} />
          </View>
        )}

        {!isUploading && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: size * 0.32,
              height: size * 0.32,
              borderRadius: (size * 0.32) / 2,
              backgroundColor: theme.colors.primary,
              borderWidth: 2,
              borderColor: theme.colors.white,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="camera" size={size * 0.16} color={theme.colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});
