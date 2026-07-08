import { apiClient } from '../client';
import type { BackendApiResponse, User, UserDTO, ForgotPasswordRequest, VerifySecurityCodeRequest } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const usersService = {
  list: () => apiClient.get<BackendApiResponse<User[]>>('/api/v1/users').then(unwrap),
  getById: (id: string) => apiClient.get<BackendApiResponse<User>>(`/api/v1/users/${id}`).then(unwrap),
  getByEmail: (email: string) => apiClient.get<BackendApiResponse<User>>(`/api/v1/users/email/${email}`).then(unwrap),
  create: (payload: UserDTO) =>
    apiClient.post<BackendApiResponse<User>>('/api/v1/users', { ...payload, role: (payload.role as string).toUpperCase() }).then(unwrap),
  update: (id: string, payload: Partial<UserDTO>) =>
    apiClient.put<BackendApiResponse<User>>(`/api/v1/users/${id}`, payload).then(unwrap),
  delete: (id: string) => apiClient.delete(`/api/v1/users/${id}`),
  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<BackendApiResponse<{ message: string }>>('/api/v1/users/forgot-password', payload).then(unwrap),
  verifySecurityCode: (payload: VerifySecurityCodeRequest) =>
    apiClient.post<BackendApiResponse<{ message: string }>>('/api/v1/users/verify-security-code', payload).then(unwrap),
};
