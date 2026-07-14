import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Storage } from '../services/storage';
import { API_BASE_URL } from '../constants';
import type { AuthResponse, Session } from '../types';

const SESSION_KEY = '@pgdesk/session';
const REQUEST_TIMEOUT_MS = 15000;

let _session: Session | null = null;

function resolveBaseUrl(): string {
  // The base URL must be set in the .env file via EXPO_PUBLIC_API_URL.
  // Constants.ts is the single source of truth for the raw value.
  const url = API_BASE_URL.trim();
  if (!url) {
    console.error('[API] EXPO_PUBLIC_API_URL is not set in .env');
    return '';
  }

  let normalizedUrl = url;

  if (normalizedUrl.endsWith('/api/v1')) {
    normalizedUrl = normalizedUrl.slice(0, -7);
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && normalizedUrl.includes('localhost')) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return normalizedUrl.replace(/localhost/g, hostIp);
    }
  }

  if (normalizedUrl.includes('localhost')) {
    if (Platform.OS === 'android') {
      return normalizedUrl.replace(/localhost/g, '10.0.2.2');
    }
    return normalizedUrl.replace(/localhost/g, '127.0.0.1');
  }

  return normalizedUrl;
}

export const API_URL = resolveBaseUrl();
console.log('[API] base URL:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

function isValidSession(data: any): data is Session {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.accessToken === 'string' &&
    typeof data.refreshToken === 'string' &&
    typeof data.userId === 'string' &&
    typeof data.userRole === 'string'
  );
}

export async function getSession(): Promise<Session | null> {
  if (_session) return _session;
  const stored = await Storage.getString(SESSION_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (!isValidSession(parsed)) {
      console.warn('[API] clearing invalid/legacy session');
      await clearSession();
      return null;
    }
    _session = parsed;
    return _session;
  } catch {
    await clearSession();
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  _session = session;
  await Storage.setString(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  _session = null;
  await Storage.remove(SESSION_KEY);
}

function logNetworkError(err: AxiosError, context: string) {
  const url = err.config?.url || 'unknown';
  const method = err.config?.method?.toUpperCase() || 'UNKNOWN';
  const code = (err as any).code || err.name || 'NO_CODE';
  const message = err.message || 'Unknown error';
  const status = err.response?.status;
  const backendData = (err.response?.data as any) || {};
  const backendMessage = backendData?.message;
  const backendErrors = backendData?.errors;
  const errorDetails = backendErrors && typeof backendErrors === 'object'
    ? Object.entries(backendErrors)
        .map(([field, detail]) => `    ${field}: ${detail}`)
        .join('\n')
    : null;

  console.error(
    `[API] ${context} failed\n` +
      `  URL: ${method} ${url}\n` +
      `  Code: ${code}\n` +
      (status ? `  HTTP Status: ${status}\n` : '') +
      (backendMessage ? `  Backend Message: ${backendMessage}\n` : '') +
      (errorDetails ? `  Details:\n${errorDetails}\n` : '') +
      `  Message: ${message}\n` +
      `  Base URL: ${API_URL}\n` +
      `  Platform: ${Platform.OS}\n` +
      `  Tip: Ensure the backend is reachable from this device/emulator. ` +
      `If using a physical device, set EXPO_PUBLIC_API_URL to your host LAN IP.`
  );
}

apiClient.interceptors.request.use(async (config) => {
  if (!API_URL) {
    return Promise.reject(
      new Error('API base URL is not configured. Ensure EXPO_PUBLIC_API_URL is set in .env and the bundle was built with Expo CLI.')
    );
  }
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `${session.tokenType || 'Bearer'} ${session.accessToken}`;
    if (session.userId) {
      config.headers['X-USER-ID'] = session.userId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const axiosErr = err as AxiosError;
    logNetworkError(axiosErr, 'Request');

    const original = err.config as any;
    if (err.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshed = await refreshSession();
      if (refreshed) {
        original.headers.Authorization = `${refreshed.tokenType || 'Bearer'} ${refreshed.accessToken}`;
        return apiClient(original);
      }
      await clearSession();
    }
    return Promise.reject(err);
  }
);

const refreshClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

export async function refreshSession(): Promise<Session | null> {
  const session = await getSession();
  if (!session?.refreshToken) return null;
  try {
    const res = await refreshClient.post<AuthResponse>('/auth/refresh', {
      refreshToken: session.refreshToken,
    });
    const refreshed: Session = {
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
      tokenType: res.data.tokenType || 'Bearer',
      userId: res.data.userId,
      userName: res.data.userName,
      userRole: res.data.userRole,
    };
    await setSession(refreshed);
    return refreshed;
  } catch {
    return null;
  }
}

export async function checkApiHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    await axios.get(`${API_URL}/actuator/health`, { timeout: 5000 });
    return { ok: true, message: `Connected to ${API_URL}` };
  } catch (err) {
    const axiosErr = err as AxiosError;
    logNetworkError(axiosErr, 'Health check');
    return {
      ok: false,
      message:
        axiosErr.code === 'ECONNREFUSED' || axiosErr.message?.includes('Network Error')
          ? `Cannot reach backend at ${API_URL}. Is the server running and reachable from this device?`
          : `Backend health check failed: ${axiosErr.message}`,
    };
  }
}
