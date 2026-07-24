import { apiClient } from '../client';
import type { BackendApiResponse, Tenant, TenantDetails } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const tenantsService = {
  listByPg: (pgId: string) => apiClient.get<BackendApiResponse<Tenant[]>>(`/api/v1/tenants/pg/${pgId}`).then(unwrap),
  listActiveByPg: (pgId: string) =>
    apiClient.get<BackendApiResponse<Tenant[]>>(`/api/v1/tenants/pg/${pgId}/active`).then(unwrap),
  listByPgWithRooms: (pgId: string) =>
    apiClient.get<BackendApiResponse<Tenant[]>>(`/api/v1/tenants/pg/${pgId}/with-rooms`).then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<Tenant>>(`/api/v1/tenants/${id}`).then(unwrap),
  getDetails: (id: string) => apiClient.get<BackendApiResponse<TenantDetails>>(`/api/v1/tenants/${id}/details`).then(unwrap),
  getByBed: (bedId: string) => apiClient.get<BackendApiResponse<Tenant>>(`/api/v1/tenants/bed/${bedId}`).then(unwrap),
  create: (payload: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<Tenant>>('/api/v1/tenants', payload).then(unwrap),
  update: (id: string, payload: Partial<Tenant>) =>
    apiClient.put<BackendApiResponse<Tenant>>(`/api/v1/tenants/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/tenants/${id}`),
};
