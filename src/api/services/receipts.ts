import { apiClient } from '../client';
import type { BackendApiResponse, Receipt } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const receiptsService = {
  listByTenant: (tenantId: string) =>
    apiClient.get<BackendApiResponse<Receipt[]>>(`/api/v1/receipts/tenant/${tenantId}`).then(unwrap),
  listByRentLedger: (rentLedgerId: string) =>
    apiClient.get<BackendApiResponse<Receipt[]>>(`/api/v1/receipts/rent-ledger/${rentLedgerId}`).then(unwrap),
  getByNumber: (receiptNumber: string) =>
    apiClient.get<BackendApiResponse<Receipt>>(`/api/v1/receipts/number/${receiptNumber}`).then(unwrap),
  create: (payload: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<Receipt>>('/api/v1/receipts', payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/receipts/${id}`),
};
