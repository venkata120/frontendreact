import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, tenantsService, usersService } from '../api/services';
import { setSession, clearSession, getSession } from '../api/client';
import { Storage } from './storage';
import type {
  AuthRequest,
  OtpDispatchResponse,
  Session,
  User,
  UserRole,
  BackendUserRole,
} from '../types';

const SELECTED_TENANT_KEY = '@pgdesk/selected-tenant';
const ROLE_KEY = '@pgdesk/role';

export function mapBackendRole(role: BackendUserRole): UserRole {
  if (role === 'OWNER') return 'owner';
  if (role === 'MANAGER') return 'manager';
  return 'tenant';
}

export const AuthService = {
  async loginWithPassword(payload: AuthRequest & { role?: UserRole }): Promise<Session> {
    const response = await authService.login({ email: payload.email, password: payload.password });

    console.log('[AuthService] login response:', JSON.stringify(response, null, 2));
    const session: Session = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      tokenType: response.tokenType || 'Bearer',
      userId: response.userId,
      userName: response.userName,
      userRole: response.userRole,
    };
    await setSession(session);
    if (payload.role) {
      await Storage.setString(ROLE_KEY, payload.role);
    }
    return session;
  },

  async sendOtp(mobile: string): Promise<OtpDispatchResponse> {
    return authService.sendOtp({ mobile, isTenant: true });
  },

  async resendOtp(reqId: string): Promise<OtpDispatchResponse> {
    return authService.resendOtp({ reqId, retryChannel: 'SMS' });
  },

  async verifyOtpAndLogin(
    mobile: string,
    otp: string,
    reqId: string
  ): Promise<{ session: Session; user: User }> {
    const response = await authService.verifyOtp({ mobile, otp, reqId, isTenant: true });

    const session: Session = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      tokenType: response.tokenType || 'Bearer',
      userId: response.userId,
      userName: response.userName,
      userRole: response.userRole,
    };

    await setSession(session);
    await Storage.setString(ROLE_KEY, mapBackendRole(session.userRole));

    const user = await AuthService.fetchUserForSession(session);
    return { session, user };
  },

  async fetchUserForSession(session: Session): Promise<User> {
    const role = mapBackendRole(session.userRole);
    if (role === 'tenant') {
      try {
        const tenant = await tenantsService.getById(session.userId);
        return {
          id: tenant.id,
          name: tenant.fullName,
          email: tenant.email || '',
          role: 'tenant',
          active: tenant.status === 'ACTIVE',
          mobile: tenant.phone,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
        };
      } catch {
        // Fall back to a minimal user built from the session so login still
        // succeeds even if the tenant profile endpoint is unreachable.
        return {
          id: session.userId,
          name: session.userName,
          email: '',
          role: 'tenant',
          active: true,
        };
      }
    }
    return usersService.getById(session.userId);
  },

  async refreshSession(): Promise<Session | null> {
    const session = await getSession();
    if (!session?.refreshToken) return null;
    const response = await authService.refresh(session.refreshToken);
    const refreshed: Session = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      tokenType: response.tokenType || 'Bearer',
      userId: response.userId,
      userName: response.userName,
      userRole: response.userRole,
    };
    await setSession(refreshed);
    return refreshed;
  },

  async logout(): Promise<void> {
    await clearSession();
    await Storage.remove(ROLE_KEY);
    await AsyncStorage.removeItem(SELECTED_TENANT_KEY);
  },

  async getSession(): Promise<Session | null> {
    return getSession();
  },

  async getRole(): Promise<UserRole | null> {
    return (await Storage.getString(ROLE_KEY)) as UserRole | null;
  },

  async setRole(role: UserRole): Promise<void> {
    await Storage.setString(ROLE_KEY, role);
  },

  async getSelectedTenantId(): Promise<string | null> {
    return AsyncStorage.getItem(SELECTED_TENANT_KEY);
  },

  async setSelectedTenantId(tenantId: string): Promise<void> {
    await AsyncStorage.setItem(SELECTED_TENANT_KEY, tenantId);
  },
};
