import { apiClient } from '../client';
import type { BackendApiResponse, Announcement } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const announcementsService = {
  listByPg: (pgId: string) =>
    apiClient.get<BackendApiResponse<Announcement[]>>(`/api/v1/announcements/pg/${pgId}`).then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<Announcement>>(`/api/v1/announcements/${id}`).then(unwrap),
};
