export const APP_NAME = 'PG Desk Tenant';
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';
export const DEFAULT_TENANT_ID = process.env.EXPO_PUBLIC_TENANT_ID || '';

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
