// ------------------------------------------------------------------
// Enums aligned with the Spring Boot backend
// ------------------------------------------------------------------

export type UserRole = 'owner' | 'manager' | 'tenant';
export type BackendUserRole = 'OWNER' | 'MANAGER' | 'ADMIN';

export type TenantStatus = 'ACTIVE' | 'EXITED';
export type RentStatus = 'PAID' | 'PARTIAL' | 'DUE';
export type BedStatus = 'VACANT' | 'OCCUPIED';
export type PgType = 'MEN' | 'LADIES' | 'CO_LIVE';
export type FoodType = 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN' | 'JAIN';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACKS';
export type MenuType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY';
export type SpecialAction = 'NONE' | 'HIGHLIGHT' | 'SPECIAL';
export type AnnouncementDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

export type NoticeType = 'NOTICE' | 'ANNOUNCEMENT' | 'INFORMATION' | 'COMPLAINT' | 'REQUEST' | 'REMINDER' | 'MAINTENANCE' | 'EVENT' | 'OTHER';
export type SenderType = 'OWNER' | 'MANAGER' | 'TENANT' | 'SYSTEM';
export type AudienceType = 'ALL_TENANTS' | 'SPECIFIC_TENANTS' | 'OWNER' | 'MANAGER' | 'OWNER_AND_MANAGER';
export type NoticePriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type NoticeStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
export type NoticeRecipientType = 'TENANT' | 'OWNER' | 'MANAGER';

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
  rentPerMonth?: number;
  maintenancePerMonth?: number;
  depositMonths?: number;
  noticePeriodDays?: number;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  sharingType?: string;
  createdAt?: string;
  updatedAt?: string;
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
  bedId?: string;
  fullName: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  parentName?: string;
  parentPhone?: string;
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
  channel: 'EMAIL' | 'SMS';
  status: 'PENDING' | 'SENT';
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------
// Food Menu
// ------------------------------------------------------------------

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
// Misc
// ------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
