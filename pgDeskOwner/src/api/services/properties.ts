import { apiClient, API_URL, getSession } from '../client';
import type { BackendApiResponse, Property, ProfileImageFile, ProfileUploadResponse } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const propertiesService = {
  list: () => apiClient.get<BackendApiResponse<Property[]>>('/api/v1/pg-properties').then(unwrap),
  listByOwner: (ownerId: string) =>
    apiClient.get<BackendApiResponse<Property[]>>(`/api/v1/pg-properties/owner/${ownerId}`).then(unwrap),
  listByManager: (managerId: string) =>
    apiClient.get<BackendApiResponse<Property[]>>(`/api/v1/pg-properties/manager/${managerId}`).then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<Property>>(`/api/v1/pg-properties/${id}`).then(unwrap),
  create: (payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<Property>>('/api/v1/pg-properties', payload).then(unwrap),
  update: (id: string, payload: Partial<Property>) =>
    apiClient.put<BackendApiResponse<Property>>(`/api/v1/pg-properties/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/pg-properties/${id}`),
  uploadImage: async (propertyId: string, file: ProfileImageFile | File, folder = 'profiles') => {
    const formData = new FormData();
    if (typeof File !== 'undefined' && file instanceof File) {
      formData.append('file', file);
    } else {
      const imageFile = file as ProfileImageFile;
      formData.append('file', {
        uri: imageFile.uri,
        name: imageFile.name || 'property.jpg',
        type: imageFile.type || 'image/jpeg',
      } as any);
    }
    formData.append('profileType', 'PG');
    formData.append('entityId', propertyId);
    formData.append('folder', folder);

    // Use fetch for multipart uploads so React Native can set the correct
    // multipart boundary. Axios's default JSON Content-Type can leak into the
    // request and cause the backend to return a 500.
    const session = await getSession();
    const headers: Record<string, string> = {};
    if (session?.accessToken) {
      headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`;
    }

    const response = await fetch(`${API_URL}/api/v1/profiles/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = (await response.json()) as BackendApiResponse<ProfileUploadResponse>;
    if (!response.ok || json.code >= 400) {
      const message = json.message || `Image upload failed (${response.status})`;
      throw new Error(message);
    }
    return json.data;
  },
};
