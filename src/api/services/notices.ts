import { apiClient } from '../client';
import type {
  BackendApiResponse,
  NoticeBoard,
  NoticeBoardSearchRequest,
  NoticeBoardSearchResponse,
  CreateNoticePayload,
} from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const noticesService = {
  search: (payload: NoticeBoardSearchRequest) =>
    apiClient
      .post<BackendApiResponse<NoticeBoardSearchResponse>>('/api/v1/notices/search', payload)
      .then(unwrap),

  getById: (id: number) =>
    apiClient.get<BackendApiResponse<NoticeBoard>>(`/api/v1/notices/${id}`).then(unwrap),

  create: (payload: CreateNoticePayload) =>
    apiClient.post<BackendApiResponse<NoticeBoard>>('/api/v1/notices', payload).then(unwrap),

  update: (id: number, payload: Partial<CreateNoticePayload>) =>
    apiClient.put<BackendApiResponse<NoticeBoard>>(`/api/v1/notices/${id}`, payload).then(unwrap),

  archive: (id: number) =>
    apiClient.delete<BackendApiResponse<NoticeBoard>>(`/api/v1/notices/${id}`).then(unwrap),
};
