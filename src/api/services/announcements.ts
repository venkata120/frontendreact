import { apiClient } from '../client';
import type { BackendApiResponse, Announcement } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const announcementsService = {
  listByPg: (pgId: string) =>
    apiClient.get<BackendApiResponse<Announcement[]>>(`/api/v1/announcements/pg/${pgId}`).then(unwrap),
  listByCreator: (userId: string) =>
    apiClient.get<BackendApiResponse<Announcement[]>>(`/api/v1/announcements/creator/${userId}`).then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<Announcement>>(`/api/v1/announcements/${id}`).then(unwrap),
  create: (payload: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<Announcement>>('/api/v1/announcements', payload).then(unwrap),
  update: (id: string, payload: Partial<Announcement>) =>
    apiClient.put<BackendApiResponse<Announcement>>(`/api/v1/announcements/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/announcements/${id}`),
  sendToAll: (id: string) =>
    apiClient.post<BackendApiResponse<Announcement>>(`/api/v1/announcements/${id}/send-to-all`).then(unwrap),
};
