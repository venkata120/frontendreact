import { apiClient } from '../client';
import type {
  AuthRequest,
  AuthResponse,
  BackendApiResponse,
  SendOtpRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  OtpDispatchResponse,
} from '../../types';

const unwrap = <T>(res: { data: BackendApiResponse<T> }): T => res.data.data;

export const authService = {
  login: (payload: AuthRequest) =>
    apiClient.post<BackendApiResponse<AuthResponse>>('/api/v1/auth/login', payload).then(unwrap),
  refresh: (refreshToken: string) =>
    apiClient.post<BackendApiResponse<AuthResponse>>('/api/v1/auth/refresh', { refreshToken }).then(unwrap),
  sendOtp: (payload: SendOtpRequest) =>
    apiClient.post<BackendApiResponse<OtpDispatchResponse>>('/api/v1/auth/otp/send', payload).then(unwrap),
  verifyOtp: (payload: VerifyOtpRequest) =>
    apiClient.post<BackendApiResponse<AuthResponse>>('/api/v1/auth/otp/verify', payload).then(unwrap),
  resendOtp: (payload: ResendOtpRequest) =>
    apiClient.post<BackendApiResponse<OtpDispatchResponse>>('/api/v1/auth/otp/resend', payload).then(unwrap),
};
