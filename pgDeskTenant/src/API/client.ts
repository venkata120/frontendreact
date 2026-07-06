import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Storage } from '../services/storage';
import { API_BASE_URL } from '../constants';
import type { AuthResponse } from '../types';

const SESSION_KEY = '@pgdesk/session';
const REQUEST_TIMEOUT_MS = 15000;

let _session: AuthResponse | null = null;

function resolveBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  let url = envUrl || API_BASE_URL;
  const userProvidedUrl = !!envUrl;

  if (url.endsWith('/api/v1')) {
    url = url.slice(0, -7);
  }

  if (userProvidedUrl) {
    return url;
  }

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

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

export async function getSession(): Promise<AuthResponse | null> {
  if (_session) return _session;
  const stored = await Storage.getString(SESSION_KEY);
  if (!stored) return null;
  try {
    _session = JSON.parse(stored) as AuthResponse;
    return _session;
  } catch {
    return null;
  }
}

export async function setSession(session: AuthResponse): Promise<void> {
  _session = session;
  await Storage.setString(SESSION_KEY, JSON.stringify(session));
}

apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});
