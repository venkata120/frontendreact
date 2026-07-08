import { apiClient } from '../client';
import type { BackendApiResponse, RentLedger } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const rentLedgersService = {
  listByTenant: (tenantId: string) =>
    apiClient.get<BackendApiResponse<RentLedger[]>>(`/api/v1/rent-ledgers/tenant/${tenantId}`).then(unwrap),
  getByTenantMonth: (tenantId: string, month: string) =>
    apiClient.get<BackendApiResponse<RentLedger>>(`/api/v1/rent-ledgers/tenant/${tenantId}/month/${month}`).then(unwrap),
  listByStatus: (status: string) =>
    apiClient.get<BackendApiResponse<RentLedger[]>>(`/api/v1/rent-ledgers/status/${status}`).then(unwrap),
  create: (payload: Omit<RentLedger, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<RentLedger>>('/api/v1/rent-ledgers', payload).then(unwrap),
  update: (id: string, payload: Partial<RentLedger>) =>
    apiClient.put<BackendApiResponse<RentLedger>>(`/api/v1/rent-ledgers/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/rent-ledgers/${id}`),
};
