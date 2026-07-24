import { apiClient } from '../client';
import type { BackendApiResponse, ExpenseMaster } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const expenseMastersService = {
  list: () => apiClient.get<BackendApiResponse<ExpenseMaster[]>>('/api/v1/expense-masters').then(unwrap),
  listActive: () =>
    apiClient.get<BackendApiResponse<ExpenseMaster[]>>('/api/v1/expense-masters').then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<ExpenseMaster>>(`/api/v1/expense-masters/${id}`).then(unwrap),
  create: (payload: Omit<ExpenseMaster, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<ExpenseMaster>>('/api/v1/expense-masters', payload).then(unwrap),
  update: (id: string, payload: Partial<ExpenseMaster>) =>
    apiClient.put<BackendApiResponse<ExpenseMaster>>(`/api/v1/expense-masters/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/expense-masters/${id}`),
};
