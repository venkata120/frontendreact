import { apiClient } from '../client';
import type { BackendApiResponse, Expense } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const expensesService = {
  listByPg: (pgId: string) =>
    apiClient.get<BackendApiResponse<Expense[]>>(`/api/v1/expenses/pg/${pgId}/recent/12`).then(unwrap),
  listByPgMonthYear: (pgId: string, month: string, year: number) =>
    apiClient.get<BackendApiResponse<Expense[]>>(`/api/v1/expenses/pg/${pgId}/month/${month}/year/${year}`).then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<Expense>>(`/api/v1/expenses/${id}`).then(unwrap),
  create: (payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<BackendApiResponse<Expense>>('/api/v1/expenses', payload).then(unwrap),
  update: (id: string, payload: Partial<Expense>) =>
    apiClient.put<BackendApiResponse<Expense>>(`/api/v1/expenses/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/expenses/${id}`),
};
