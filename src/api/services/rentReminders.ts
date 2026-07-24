import { apiClient } from '../client';
import type { BackendApiResponse, RentReminder } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const rentRemindersService = {
  listByTenant: (tenantId: string) =>
    apiClient.get<BackendApiResponse<RentReminder[]>>(`/api/v1/rent-reminders/tenant/${tenantId}`).then(unwrap),
  listPending: () => apiClient.get<BackendApiResponse<RentReminder[]>>('/api/v1/rent-reminders/pending').then(unwrap),
  listDueByDate: (date: string) =>
    apiClient.get<BackendApiResponse<RentReminder[]>>(`/api/v1/rent-reminders/due/${date}`).then(unwrap),
  listByRentLedger: (rentLedgerId: string) =>
    apiClient.get<BackendApiResponse<RentReminder[]>>(`/api/v1/rent-reminders/rent-ledger/${rentLedgerId}`).then(unwrap),
  create: (payload: Omit<RentReminder, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<RentReminder>>('/api/v1/rent-reminders', payload).then(unwrap),
  markSent: (id: string) =>
    apiClient.put<BackendApiResponse<RentReminder>>(`/api/v1/rent-reminders/${id}/mark-sent`).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/rent-reminders/${id}`),
};
