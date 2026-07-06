import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../api/services';
import type { ProfileImageFile, ProfileType, ProfileUploadResponse } from '../../types';

const profileKey = 'profiles';

export const useUploadProfileImage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      profileType,
      entityId,
      folder,
    }: {
      file: ProfileImageFile | File;
      profileType: ProfileType;
      entityId: string;
      folder?: string;
    }) => profileService.upload(file, profileType, entityId, folder),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: [profileKey, 'download', vars.folder || 'profiles', vars.profileType, vars.entityId],
      });
    },
  });
};

export const useDownloadProfileImage = (
  entityId?: string,
  profileType: ProfileType = 'OWNER',
  folder = 'profiles',
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [profileKey, 'download', folder, profileType, entityId],
    queryFn: () => profileService.download(entityId!, profileType, folder),
    enabled: !!entityId && (options?.enabled ?? true),
  });
};

export type { ProfileUploadResponse };
