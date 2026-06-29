export const APP_NAME = 'PG Desk Tenant';
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = 'https://api.pgdesk.example.com/v1';
export const MOCK_DELAY_MS = 500;
export const OTP_LENGTH = 4;
export const PHONE_COUNTRY_CODE = '+91';

export const ROUTES = {
  AUTH: {
    LOGIN: '/(auth)/login',
    OTP: '/(auth)/otp',
    SIGNUP: '/(auth)/signup',
  },
  APP: {
    HOME: '/(app)/(tabs)',
    PENDING_DUES: '/(app)/pending-dues',
    EDIT_PROFILE: '/(app)/edit-profile',
  },
} as const;
