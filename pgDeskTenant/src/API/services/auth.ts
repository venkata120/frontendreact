import { apiClient } from '../client';
import type { AuthRequest, AuthResponse, BackendApiResponse } from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const authService = {
  login: (payload: AuthRequest) =>
    apiClient.post<BackendApiResponse<AuthResponse>>('/api/v1/auth/login', payload).then(unwrap),
  refresh: (refreshToken: string) =>
    apiClient.post<BackendApiResponse<AuthResponse>>('/api/v1/auth/refresh', { refreshToken }).then(unwrap),
};
