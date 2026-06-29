import type { AuthResponse, PaginatedResponse, Payment, Property, Room, Staff, Tenant, User, UserRole } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_OTP = '4444';

let currentUser: User | null = null;

const mockUsers: User[] = [
  {
    id: '1',
    phone: '+919999999999',
    name: 'Rahul Sharma',
    role: 'owner',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const mockProperties: Property[] = [
  {
    id: 'p1',
    name: 'SV Mens PG',
    type: 'PG',
    address: 'Bengaluru, Karnataka',
    floors: 3,
    advanceAmount: 5000,
    images: [],
    ownerId: '1',
  },
];

const mockRooms: Room[] = [
  { id: 'r1', propertyId: 'p1', roomNumber: '101', floor: 'Ground Floor', sharingType: '2 Sharing', totalBeds: 2, occupiedBeds: 2, rentPerBed: 10000 },
  { id: 'r2', propertyId: 'p1', roomNumber: '102', floor: 'Ground Floor', sharingType: '3 Sharing', totalBeds: 3, occupiedBeds: 1, rentPerBed: 7500 },
];

const mockTenants: Tenant[] = [
  { id: 't1', userId: 'u2', name: 'Raj Kumar', phone: '9876543210', roomId: 'r1', roomNumber: '101', bedNumber: '101 B', floor: 'Ground Floor', checkInDate: '22-05-2026', rentAmount: 10000, depositAmount: 2000, maintenanceAmount: 1000, refundableAmount: 1000, status: 'active', avatar: 'https://i.pravatar.cc/150?u=t1' },
  { id: 't2', userId: 'u3', name: 'Sridhar', phone: '9876543211', roomId: 'r2', roomNumber: '102', bedNumber: '102 A', floor: 'Ground Floor', checkInDate: '20-05-2026', rentAmount: 7500, depositAmount: 1500, maintenanceAmount: 800, refundableAmount: 800, status: 'active', avatar: 'https://i.pravatar.cc/150?u=t2' },
  { id: 't3', userId: 'u4', name: 'Amit Sharma', phone: '9876543212', roomId: 'r1', roomNumber: '101', bedNumber: '101 A', floor: 'Ground Floor', checkInDate: '18-05-2026', rentAmount: 6500, depositAmount: 1500, maintenanceAmount: 700, refundableAmount: 700, status: 'active', avatar: 'https://i.pravatar.cc/150?u=t3' },
];

const mockStaff: Staff[] = [
  { id: 's1', name: 'Rajesh', phone: '9987665632', role: 'cook', salary: 15000, department: 'Kitchen', status: 'active', avatar: 'https://i.pravatar.cc/150?u=s1' },
  { id: 's2', name: 'Lakshmi', phone: '9876543210', role: 'Maid', salary: 10000, department: 'Housekeeping', status: 'active', avatar: 'https://i.pravatar.cc/150?u=s2' },
  { id: 's3', name: 'Raju', phone: '6302234665', role: 'Security', salary: 10000, department: 'Security', status: 'active', avatar: 'https://i.pravatar.cc/150?u=s3' },
];

const mockPayments: Payment[] = [
  { id: 'pay1', tenantId: 't1', amount: 10000, type: 'rent', status: 'paid', date: '2026-05-22', description: 'May rent' },
  { id: 'pay2', tenantId: 't2', amount: 7500, type: 'rent', status: 'pending', date: '2026-05-20', description: 'May rent' },
];

export const mockApi = {
  auth: {
    async login(phone: string) {
      await delay(800);
      return { message: `OTP sent to ${phone}`, otp: MOCK_OTP };
    },

    async verifyOTP(phone: string, otp: string, role: UserRole | null): Promise<AuthResponse> {
      await delay(1000);
      if (otp !== MOCK_OTP) {
        throw new Error('Invalid OTP. Try 4444.');
      }
      const user: User = {
        id: '1',
        phone,
        name: role === 'tenant' ? 'Raj Kumar' : 'Rahul Sharma',
        role: role || 'owner',
        isActive: true,
        createdAt: new Date().toISOString(),
        propertyId: 'p1',
      };
      currentUser = user;
      return {
        user,
        token: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };
    },

    async forgotPassword(phone: string) {
      await delay(800);
      return { message: `Reset OTP sent to ${phone}` };
    },

    async resetPassword(payload: { phone: string; otp: string; password: string }) {
      await delay(800);
      if (payload.otp !== MOCK_OTP) {
        throw new Error('Invalid OTP');
      }
      return { message: 'Password reset successfully' };
    },

    async logout() {
      await delay(300);
      currentUser = null;
      return { message: 'Logged out' };
    },

    async refreshToken(token: string) {
      await delay(500);
      return { token: 'mock-access-token-refreshed', refreshToken: 'mock-refresh-token' };
    },
  },

  users: {
    async getProfile(): Promise<User> {
      await delay(300);
      if (!currentUser) throw new Error('Not authenticated');
      return currentUser;
    },
    async updateProfile(user: Partial<User>): Promise<User> {
      await delay(500);
      if (!currentUser) throw new Error('Not authenticated');
      currentUser = { ...currentUser, ...user };
      return currentUser;
    },
  },

  properties: {
    async list() {
      await delay(400);
      return mockProperties;
    },
    async create(data: Omit<Property, 'id'>) {
      await delay(600);
      const property: Property = { ...data, id: `p${Date.now()}` };
      mockProperties.push(property);
      return property;
    },
    async get(id: string) {
      await delay(300);
      return mockProperties.find((p) => p.id === id) || null;
    },
  },

  rooms: {
    async list() {
      await delay(400);
      return mockRooms;
    },
    async create(data: Omit<Room, 'id'>) {
      await delay(600);
      const room: Room = { ...data, id: `r${Date.now()}` };
      mockRooms.push(room);
      return room;
    },
  },

  tenants: {
    async list(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Tenant>> {
      await delay(500);
      let data = [...mockTenants];
      if (params?.status) {
        data = data.filter((t) => t.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        data = data.filter((t) => t.name.toLowerCase().includes(q) || t.roomNumber.includes(q));
      }
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const start = (page - 1) * limit;
      return {
        data: data.slice(start, start + limit),
        total: data.length,
        page,
        limit,
        hasMore: start + limit < data.length,
      };
    },
    async get(id: string) {
      await delay(300);
      return mockTenants.find((t) => t.id === id) || null;
    },
    async create(data: Omit<Tenant, 'id'>) {
      await delay(600);
      const tenant: Tenant = { ...data, id: `t${Date.now()}` };
      mockTenants.push(tenant);
      return tenant;
    },
    async update(id: string, data: Partial<Tenant>) {
      await delay(500);
      const index = mockTenants.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Tenant not found');
      mockTenants[index] = { ...mockTenants[index], ...data };
      return mockTenants[index];
    },
  },

  staff: {
    async list(params?: { department?: string; search?: string }) {
      await delay(400);
      let data = [...mockStaff];
      if (params?.department && params.department !== 'All') {
        data = data.filter((s) => s.department === params.department);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        data = data.filter((s) => s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q));
      }
      return data;
    },
    async create(data: Omit<Staff, 'id'>) {
      await delay(600);
      const staff: Staff = { ...data, id: `s${Date.now()}` };
      mockStaff.push(staff);
      return staff;
    },
  },

  payments: {
    async list(params?: { type?: string; status?: string }) {
      await delay(400);
      let data = [...mockPayments];
      if (params?.type) data = data.filter((p) => p.type === params.type);
      if (params?.status) data = data.filter((p) => p.status === params.status);
      return data;
    },
    async create(data: Omit<Payment, 'id'>) {
      await delay(600);
      const payment: Payment = { ...data, id: `pay${Date.now()}` };
      mockPayments.push(payment);
      return payment;
    },
  },
};
