import type { UserRole } from '../types';

export const getRoleBasedRoute = (
  role: UserRole | null
): '/(app)/(manager-tabs)' | '/(app)/(tabs)' => {
  switch (role) {
    case 'manager':
      return '/(app)/(manager-tabs)';
    case 'owner':
    default:
      return '/(app)/(tabs)';
  }
};
