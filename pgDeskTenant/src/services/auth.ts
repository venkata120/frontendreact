import { Storage } from './storage';
import { mockApi } from '../API/mockApi';
import type { AuthResponse, User, UserRole } from '../types';

const SESSION_KEY = '@pgdesk/session';
const ROLE_KEY = '@pgdesk/role';

export const AuthService = {
  async login(payload: { phone: string; role?: UserRole }): Promise<{ message: string; otp: string }> {
    await Storage.setString(ROLE_KEY, payload.role || 'tenant');
    return mockApi.auth.login(payload.phone);
  },

  async verifyOTP(payload: { phone: string; otp: string }): Promise<AuthResponse> {
    const role = (await Storage.getString(ROLE_KEY)) as UserRole;
    const response = await mockApi.auth.verifyOTP(payload.phone, payload.otp, role);
    await Storage.setObject(SESSION_KEY, response);
    return response;
  },

  async logout(): Promise<void> {
    await Storage.remove(SESSION_KEY);
    await Storage.remove(ROLE_KEY);
  },

  async getSession(): Promise<AuthResponse | null> {
    return Storage.getObject<AuthResponse>(SESSION_KEY);
  },

  async getRole(): Promise<UserRole | null> {
    return (await Storage.getString(ROLE_KEY)) as UserRole | null;
  },

  async forgotPassword(phone: string): Promise<{ message: string }> {
    return mockApi.auth.forgotPassword(phone);
  },

  async resetPassword(payload: { phone: string; otp: string; password: string }): Promise<{ message: string }> {
    return mockApi.auth.resetPassword(payload);
  },

  async getProfile(): Promise<User> {
    return mockApi.users.getProfile();
  },

  async updateProfile(user: Partial<User>): Promise<User> {
    return mockApi.users.updateProfile(user);
  },
};
