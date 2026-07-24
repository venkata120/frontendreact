import { apiClient } from '../client';
import type { BackendApiResponse, AnnouncementHistory } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const announcementHistoryService = {
  listByAnnouncement: (announcementId: string) =>
    apiClient.get<BackendApiResponse<AnnouncementHistory[]>>(`/api/v1/announcement-history/announcement/${announcementId}`).then(unwrap),
  listByTenant: (tenantId: string) =>
    apiClient.get<BackendApiResponse<AnnouncementHistory[]>>(`/api/v1/announcement-history/tenant/${tenantId}`).then(unwrap),
  create: (payload: Omit<AnnouncementHistory, 'id'>) =>
    apiClient.post<BackendApiResponse<AnnouncementHistory>>('/api/v1/announcement-history', payload).then(unwrap),
  markDelivered: (id: string) =>
    apiClient.put<BackendApiResponse<AnnouncementHistory>>(`/api/v1/announcement-history/${id}/mark-delivered`).then(unwrap),
  markFailed: (id: string, notes?: string) =>
    apiClient.put<BackendApiResponse<AnnouncementHistory>>(`/api/v1/announcement-history/${id}/mark-failed`, null, { params: { notes } }).then(unwrap),
};
