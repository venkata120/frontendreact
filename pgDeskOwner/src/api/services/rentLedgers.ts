import { apiClient } from '../client';
import type { BackendApiResponse, RentLedger, RentLedgerStatusSummary } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const rentLedgersService = {
  listByTenant: (tenantId: string) =>
    apiClient.get<BackendApiResponse<RentLedger[]>>(`/api/v1/rent-ledgers/tenant/${tenantId}`).then(unwrap),
  getByTenantMonth: (tenantId: string, month: string) =>
    apiClient.get<BackendApiResponse<RentLedger>>(`/api/v1/rent-ledgers/tenant/${tenantId}/month/${month}`).then(unwrap),
  listByStatus: (status: string) =>
    apiClient.get<BackendApiResponse<RentLedger[]>>(`/api/v1/rent-ledgers/status/${status}`).then(unwrap),
  listByStatusWithTenants: async (status: string) => {
    const ledgers = await apiClient.get<BackendApiResponse<RentLedger[]>>(`/api/v1/rent-ledgers/status/${status}`).then(unwrap);
    return ledgers;
  },
  listByPgMonthYear: (pgId: string, month: string, year: number) =>
    apiClient.get<BackendApiResponse<RentLedger[]>>(`/api/v1/rent-ledgers/pg/${pgId}/month/${month}/year/${year}`).then(unwrap),
  statusSummary: () =>
    apiClient.get<BackendApiResponse<RentLedgerStatusSummary>>('/api/v1/rent-ledgers/status-summary').then(unwrap),
  create: (payload: Omit<RentLedger, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<RentLedger>>('/api/v1/rent-ledgers', payload).then(unwrap),
  update: (id: string, payload: Partial<RentLedger>) =>
    apiClient.put<BackendApiResponse<RentLedger>>(`/api/v1/rent-ledgers/${id}`, payload).then(unwrap),
  recordPayment: (ledger: RentLedger, amount: number) => {
    const newCollected = (ledger.collectedAmount || 0) + amount;
    const status = newCollected >= ledger.rentAmount ? 'PAID' : newCollected > 0 ? 'PARTIAL' : 'DUE';
    const { tenant, ...ledgerPayload } = ledger;
    return apiClient
      .put<BackendApiResponse<RentLedger>>(`/api/v1/rent-ledgers/${ledger.id}`, {
        ...ledgerPayload,
        collectedAmount: newCollected,
        status,
      })
      .then(unwrap);
  },
  delete: (id: string) => apiClient.delete(`/api/v1/rent-ledgers/${id}`),
};
