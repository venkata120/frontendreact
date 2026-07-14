import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_TENANT_ID } from '@env';

export const APP_NAME = 'PG Desk Tenant';
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = EXPO_PUBLIC_API_URL || ''; // set in .env only
export const DEFAULT_TENANT_ID = EXPO_PUBLIC_TENANT_ID;

export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
  },
  APP: {
    HOME: '/(app)/(tabs)',
    PENDING_DUES: '/(app)/pending-dues',
    EDIT_PROFILE: '/(app)/edit-profile',
  },
} as const;
