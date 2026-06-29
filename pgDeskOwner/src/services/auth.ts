import { authService } from '../api/services';
import { setSession, clearSession, getSession } from '../api/client';
import { Storage } from './storage';
import type { AuthRequest, Session, UserRole, BackendUserRole } from '../types';

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
};
