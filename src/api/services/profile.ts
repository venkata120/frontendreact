import { apiClient } from '../client';
import type {
  BackendApiResponse,
  ProfileDownloadResponse,
  ProfileImageFile,
  ProfileType,
  ProfileUploadResponse,
} from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

function appendFile(formData: FormData, file: ProfileImageFile | File) {
  if (typeof File !== 'undefined' && file instanceof File) {
    formData.append('file', file);
    return;
  }

  const imageFile = file as ProfileImageFile;
  const fileName = imageFile.name || 'profile.jpg';
  const type = imageFile.type || 'image/jpeg';

  formData.append('file', {
    uri: imageFile.uri,
    name: fileName,
    type,
  } as any);
}

export const profileService = {
  upload: (
    file: ProfileImageFile | File,
    profileType: ProfileType,
    entityId: string,
    folder = 'profiles'
  ) => {
    const formData = new FormData();
    appendFile(formData, file);
    formData.append('profileType', profileType);
    formData.append('entityId', entityId);
    formData.append('folder', folder);

    return apiClient
      .post<BackendApiResponse<ProfileUploadResponse>>('/api/v1/profiles/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap);
  },

  download: (entityId: string, profileType: ProfileType, folder = 'profiles') =>
    apiClient
      .get<BackendApiResponse<ProfileDownloadResponse>>('/api/v1/profiles/download', {
        params: { folder, profileType, entityId },
      })
      .then(unwrap),
};
