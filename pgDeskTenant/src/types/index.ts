export type UserRole = 'owner' | 'manager' | 'tenant';

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  propertyId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  floors: number;
  advanceAmount: number;
  images: string[];
  ownerId: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: string;
  sharingType: string;
  totalBeds: number;
  occupiedBeds: number;
  rentPerBed: number;
}

export interface Tenant {
  id: string;
  userId: string;
  name: string;
  phone: string;
  roomId: string;
  roomNumber: string;
  bedNumber: string;
  floor: string;
  checkInDate: string;
  rentAmount: number;
  depositAmount: number;
  maintenanceAmount: number;
  refundableAmount: number;
  status: 'active' | 'left' | 'pending';
  avatar?: string;
}

export interface Staff {
  id: string;
  name: string;
  phone: string;
  role: string;
  salary: number;
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Payment {
  id: string;
  tenantId?: string;
  staffId?: string;
  amount: number;
  type: 'rent' | 'salary' | 'maintenance' | 'other';
  status: 'paid' | 'pending';
  date: string;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
