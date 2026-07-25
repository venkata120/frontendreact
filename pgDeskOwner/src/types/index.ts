// ------------------------------------------------------------------
// Enums aligned with the Spring Boot backend
// ------------------------------------------------------------------

export type UserRole = 'owner' | 'manager' | 'tenant';
export type BackendUserRole = 'OWNER' | 'MANAGER';

export type BedStatus = 'VACANT' | 'OCCUPIED';
export type TenantStatus = 'ACTIVE' | 'EXITED';
export type RentStatus = 'PAID' | 'PARTIAL' | 'DUE';
export type DocumentType = 'AADHAR' | 'PAN' | 'PASSPORT' | 'VOTER_ID';
export type ReminderChannel = 'EMAIL' | 'SMS';
export type ReminderStatus = 'PENDING' | 'SENT';
export type AnnouncementDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';
export type PgType = 'MEN' | 'LADIES' | 'CO_LIVE';

// ------------------------------------------------------------------
// Backend common wrapper
// ------------------------------------------------------------------

export interface BackendApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

// ------------------------------------------------------------------
// Auth
// ------------------------------------------------------------------

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  userName: string;
  userRole: BackendUserRole;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  userName: string;
  userRole: BackendUserRole;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface SendOtpRequest {
  mobile: string;
  isTenant: boolean;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
  reqId: string;
  isTenant: boolean;
}

export interface ResendOtpRequest {
  reqId: string;
  retryChannel: string;
}

export interface OtpDispatchResponse {
  reqId: string;
  message: string;
}

// ------------------------------------------------------------------
// Users
// ------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
  mobile?: string;
  ownerId?: string;
  avatar?: string;
  securityCode?: string;
  securityCodeExpiry?: string;
  securityCodeAttempts?: number;
  shift?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDTO {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
  mobile?: string;
  ownerId?: string;
  shift?: string;
  department?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifySecurityCodeRequest {
  email: string;
  securityCode: string;
  newPassword: string;
}

// ------------------------------------------------------------------
// PG Properties
// ------------------------------------------------------------------

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  addressLine2?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  ownerId: string;
  pgType: PgType;
  advanceAmount?: number;
  numberOfFloors?: number;
  sharing1?: number;
  sharing2?: number;
  sharing3?: number;
  sharing4?: number;
  sharing5?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// Manager assignments
// ------------------------------------------------------------------

export interface ManagerPgAssignment {
  id: string;
  managerId: string;
  managerName?: string;
  managerEmail?: string;
  pgId: string;
  pgName?: string;
  assignedAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// Staff
// ------------------------------------------------------------------

export type StaffRole = 'MANAGER' | 'COOK' | 'HOUSE_KEEPER' | 'SECURITY' | 'MAID' | 'CLEANER' | 'OTHERS';
export type StaffShift = 'ALL_DAY' | 'MORNING' | 'AFTER_NOON' | 'NIGHT';
export type StaffPaymentType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Staff {
  staffId: string;
  propertyId: string;
  fullName: string;
  mobileNumber: string;
  role: StaffRole;
  otherRole?: string;
  shift: StaffShift;
  salary: number;
  paymentType: StaffPaymentType;
  isActive: boolean;
  profilePhotoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffRequest {
  fullName: string;
  mobileNumber: string;
  role: StaffRole;
  otherRole?: string;
  shift: StaffShift;
  salary: number;
  paymentType: StaffPaymentType;
  isActive: boolean;
}

export interface StaffImageFile {
  uri: string;
  name?: string;
  type?: string;
}

// ------------------------------------------------------------------
// Rooms & Beds
// ------------------------------------------------------------------

export interface Room {
  id: string;
  pgId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  beds?: Bed[];
  occupiedBeds?: number;
  vacantBeds?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FloorRoomsResponse {
  pgProperty: Property;
  floor: number;
  rooms: Room[];
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: BedStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// Tenants
// ------------------------------------------------------------------

export interface Tenant {
  id: string;
  pgId: string;
  bedId: string;
  fullName: string;
  phone: string;
  email?: string;
  emergencyContact?: string;
  joinDate: string; // ISO date
  exitDate?: string;
  status: TenantStatus;
  rentPerMonth: number;
  advanceAmount?: number;
  gender?: 'M' | 'F' | 'O';
  roomNumber?: string;
  floor?: number;
  bedNumber?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantDetails extends Tenant {
  floor: number;
  roomNumber: string;
  rentLedgers: RentLedger[];
}

// ------------------------------------------------------------------
// Tenant KYC
// ------------------------------------------------------------------

export interface TenantKyc {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  documentNumber: string;
  bucketName?: string;
  objectKey?: string;
  verified: boolean;
  uploadedAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// Announcements
// ------------------------------------------------------------------

export interface Announcement {
  id: string;
  pgId: string;
  createdBy: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementHistory {
  id: string;
  announcementId: string;
  tenantId: string;
  status: AnnouncementDeliveryStatus;
  sentAt?: string;
  notes?: string;
}

// ------------------------------------------------------------------
// Rent Ledger & Receipts & Reminders
// ------------------------------------------------------------------

export interface RentLedger {
  id: string;
  tenantId: string;
  tenant?: Tenant;
  rentMonth: string; // "2026-02"
  rentYear: number;
  rentAmount: number;
  dueDate: string;
  collectedAmount?: number;
  status: RentStatus;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentLedgerStatusSummary {
  statusCounts: Record<string, number>;
  ledgers: RentLedger[];
}

export interface Receipt {
  id: string;
  tenantId: string;
  rentLedgerId: string;
  receiptNumber: string;
  bucketName?: string;
  objectKey?: string;
  issuedDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentReminder {
  id: string;
  tenantId: string;
  rentLedgerId: string;
  reminderDate: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// Expenses
// ------------------------------------------------------------------

export interface ExpenseMaster {
  id: string;
  categoryCode: string;
  categoryName: string;
  subcategoryName?: string;
  isOther: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  pgPropertyId: string;
  expenseMasterId?: string;
  amount: number;
  expenseMonth: string;
  expenseYear: number;
  customSubcategoryName?: string;
  notes?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------------

export interface PgSummary {
  pgId: string;
  pgName: string;
  totalRooms: number;
  totalCapacity: number;
  totalTenants: number;
  activeTenants: number;
  leftTenants: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  pendingDues: number;
}

export interface DashboardResponse {
  totalPgCount: number;
  pgSummaries: PgSummary[];
  totalMonthlyRevenue: number;
  totalMonthlyExpenses: number;
  totalPendingDues: number;
}

export interface PgFinancial {
  pgId: string;
  pgName: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  dues: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalDues: number;
  netProfit: number;
  perPg: PgFinancial[];
}

export interface RoomOccupancy {
  roomId: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupiedBeds: number;
}

export interface FloorOccupancy {
  floor: number;
  rooms: RoomOccupancy[];
}

export interface PgOccupancy {
  pgId: string;
  pgName: string;
  floors: FloorOccupancy[];
}

export interface PgKycSummary {
  pgId: string;
  pgName: string;
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  totalTenants: number;
  noKycInitiated: number;
}

export interface PgRentLedgerMonthSummary {
  pgId: string;
  pgName: string;
  rentMonth: string;
  rentYear: number;
  totalTenants: number;
  notInitiated: number;
  paidCount: number;
  partialCount: number;
  dueCount: number;
}

export interface RecentActivityItem {
  activityType: string;
  pgId?: string;
  pgName?: string;
  timestamp?: string;
  tenantId?: string;
  tenantName?: string;
  expenseId?: string;
  expenseAmount?: number;
  expenseMasterId?: string;
  rentLedgerId?: string;
  rentAmount?: number;
  collectedAmount?: number;
  rentStatus?: RentStatus;
}

// ------------------------------------------------------------------
// Food Menu
// ------------------------------------------------------------------

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';
export type MenuType = 'REGULAR' | 'SPECIAL';
export type RepeatType = 'EVERYDAY' | 'WEEKLY' | 'CUSTOM';
export type SpecialAction = 'REPLACE' | 'ADD_ON';
export type FoodType = 'VEG' | 'NON_VEG' | 'EGG';

export interface FoodMenuItem {
  id?: string;
  itemName: string;
  description?: string;
  foodType?: FoodType;
  displayOrder?: number;
}

export interface FoodMenu {
  id?: string;
  propertyId: string;
  menuName: string;
  mealType: MealType;
  menuType: MenuType;
  menuDate?: string;
  repeatType: RepeatType;
  repeatDays?: number[];
  specialAction?: SpecialAction;
  items: FoodMenuItem[];
}

export interface DailyMenu {
  menuDate: string;
  mealType: MealType;
  specialMenu: boolean;
  items: FoodMenuItem[];
}

// ------------------------------------------------------------------
// Notice Board
// ------------------------------------------------------------------

export type NoticeType = 'NOTICE' | 'ANNOUNCEMENT' | 'INFORMATION' | 'COMPLAINT' | 'REQUEST' | 'REMINDER' | 'MAINTENANCE' | 'EVENT' | 'OTHER';
export type SenderType = 'OWNER' | 'MANAGER' | 'TENANT' | 'SYSTEM';
export type AudienceType = 'ALL_TENANTS' | 'SPECIFIC_TENANTS' | 'OWNER' | 'MANAGER' | 'OWNER_AND_MANAGER';
export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type NoticeStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type NoticeRecipientType = 'TENANT' | 'OWNER' | 'MANAGER';

export interface NoticeRecipient {
  id?: number;
  recipientType: NoticeRecipientType;
  recipientId: string;
}

export type CreateNoticePayload = {
  propertyId: string;
  title: string;
  description: string;
  noticeType: NoticeType;
  senderType: SenderType;
  senderId: string;
  audienceType: AudienceType;
  priority?: NoticePriority;
  status?: NoticeStatus;
  publishFrom?: string;
  publishTill?: string;
  recipients?: NoticeRecipient[];
};

export interface NoticeBoard {
  id: number;
  propertyId: string;
  title: string;
  description: string;
  noticeType: NoticeType;
  senderType: SenderType;
  senderId: string;
  audienceType: AudienceType;
  priority: NoticePriority;
  status: NoticeStatus;
  publishFrom?: string;
  publishTill?: string;
  createdDate?: string;
  createdBy?: string;
  lastModifiedDate?: string;
  lastModifiedBy?: string;
  recipients?: NoticeRecipient[];
}

export interface NoticeBoardSearchRequest {
  propertyId?: string;
  noticeType?: NoticeType;
  senderType?: SenderType;
  audienceType?: AudienceType;
  priority?: NoticePriority;
  status?: NoticeStatus;
  publishDateFrom?: string;
  publishDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  title?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface NoticeBoardSearchResponse {
  notices: NoticeBoard[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
}

// ------------------------------------------------------------------
// Profile photos
// ------------------------------------------------------------------

export type ProfileType = 'PG' | 'OWNER' | 'MANAGER' | 'TENANT' | 'STAFF';

export interface ProfileImageFile {
  uri: string;
  name?: string;
  type?: string;
}

export interface ProfileUploadPayload {
  file: ProfileImageFile | File;
  profileType: ProfileType;
  entityId: string;
  folder?: string;
}

export interface ProfileUploadResponse {
  folder: string;
  profileType: string;
  entityId: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  objectUrl: string;
}

export interface ProfileDownloadResponse {
  presignedUrl: string;
  objectKey: string;
  bucket: string;
  fileFormat: string;
}

// ------------------------------------------------------------------
// Legacy / UI-specific types (kept for screens that have no backend)
// ------------------------------------------------------------------

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
