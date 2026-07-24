import { apiClient } from '../client';
import type { BackendApiResponse, TenantKyc } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const tenantKycService = {
  listByTenant: (tenantId: string) =>
    apiClient.get<BackendApiResponse<TenantKyc[]>>(`/api/v1/tenant-kyc/tenant/${tenantId}`).then(unwrap),
  listVerifiedByTenant: (tenantId: string) =>
    apiClient.get<BackendApiResponse<TenantKyc[]>>(`/api/v1/tenant-kyc/tenant/${tenantId}/verified`).then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<TenantKyc>>(`/api/v1/tenant-kyc/${id}`).then(unwrap),
  create: (payload: Omit<TenantKyc, 'id' | 'uploadedAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<TenantKyc>>('/api/v1/tenant-kyc', payload).then(unwrap),
  verify: (id: string) => apiClient.put<BackendApiResponse<TenantKyc>>(`/api/v1/tenant-kyc/${id}/verify`).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/tenant-kyc/${id}`),
};
