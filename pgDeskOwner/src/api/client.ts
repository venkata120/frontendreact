import axios, { AxiosError } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Storage } from '../services/storage';
import { API_BASE_URL } from '../constants';
import type { AuthResponse, Session } from '../types';

const SESSION_KEY = '@pgdesk/session';
const REQUEST_TIMEOUT_MS = 15000;

let _session: Session | null = null;

/**
 * Resolve the backend base URL for the current runtime.
 * - If the env URL already points to an IP, leave it alone.
 * - On Android emulator, translate localhost -> 10.0.2.2.
 * - On iOS simulator, translate localhost -> 127.0.0.1.
 * - On a physical device, the user should set EXPO_PUBLIC_API_URL to the
 *   host machine's LAN IP (e.g. http://192.168.1.x:8080).
 */
function resolveBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  let url = envUrl || 'http://localhost:8080';
  const userProvidedUrl = !!envUrl;

  // Accept env values that still include the /api/v1 suffix.
  if (url.endsWith('/api/v1')) {
    url = url.slice(0, -7);
  }

  // If the user explicitly set a URL, trust it exactly (supports LAN IP or adb reverse).
  if (userProvidedUrl) {
    return url;
  }

  // When running in Expo Go / dev client without an env override, Metro tells us
  // the host machine's IP. This works for physical devices and simulators.
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && url.includes('localhost')) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return url.replace(/localhost/g, hostIp);
    }
  }

  if (url.includes('localhost')) {
    if (Platform.OS === 'android') {
      return url.replace(/localhost/g, '10.0.2.2');
    }
    return url.replace(/localhost/g, '127.0.0.1');
  }

  return url;
}

export const API_URL = resolveBaseUrl();
console.log('[API] base URL:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

export async function getSession(): Promise<Session | null> {
  if (_session) return _session;
  const stored = await Storage.getString(SESSION_KEY);
  if (!stored) return null;
  try {
    _session = JSON.parse(stored) as Session;
    return _session;
  } catch {
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

/**
 * Lightweight health check to verify backend reachability.
 * Use this during onboarding / debugging to surface connection issues early.
 */
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
