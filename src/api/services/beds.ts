import { apiClient } from '../client';
import type { BackendApiResponse, Bed, BedStatus } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const bedsService = {
  listByRoom: (roomId: string) => apiClient.get<BackendApiResponse<Bed[]>>(`/api/v1/beds/room/${roomId}`).then(unwrap),
  listVacantByRoom: (roomId: string) =>
    apiClient.get<BackendApiResponse<Bed[]>>(`/api/v1/beds/room/${roomId}/vacant`).then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<Bed>>(`/api/v1/beds/${id}`).then(unwrap),
  create: (payload: Omit<Bed, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<Bed>>('/api/v1/beds', payload).then(unwrap),
  updateStatus: (id: string, status: BedStatus) =>
    apiClient.put<BackendApiResponse<Bed>>(`/api/v1/beds/${id}/status?status=${status}`).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/beds/${id}`),
};
