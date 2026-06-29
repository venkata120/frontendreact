import { apiClient } from '../client';
import type { BackendApiResponse, Property } from '../../types';

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
};
