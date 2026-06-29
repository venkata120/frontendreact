import { apiClient } from '../client';
import type { BackendApiResponse, ManagerPgAssignment } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const managerAssignmentsService = {
  listByManager: (managerId: string) =>
    apiClient.get<BackendApiResponse<ManagerPgAssignment[]>>(`/api/v1/manager-assignments/manager/${managerId}`).then(unwrap),
  listByPg: (pgId: string) =>
    apiClient.get<BackendApiResponse<ManagerPgAssignment[]>>(`/api/v1/manager-assignments/pg/${pgId}`).then(unwrap),
  assign: (payload: { managerId: string; pgId: string }) =>
    apiClient.post<BackendApiResponse<ManagerPgAssignment>>('/api/v1/manager-assignments', payload).then(unwrap),
  remove: (managerId: string, pgId: string) =>
    apiClient.delete(`/api/v1/manager-assignments/manager/${managerId}/pg/${pgId}`),
};
