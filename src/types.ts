export interface StoreSettings {
  id: string;
  name: string;
  code: string;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  workStartTime: string; // e.g. "08:00"
  workEndTime: string;   // e.g. "17:00"
  lateToleranceMinutes: number; // e.g. 15
  qrRefreshIntervalSec: number; // e.g. 20
  allowManualOtpFallback: boolean;
  requireGpsValidation: boolean;
}

export interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  pin: string; // 4-6 digit PIN
  shiftStart: string; // "08:00"
  shiftEnd: string;   // "17:00"
  avatar?: string;
  isActive: boolean;
  joinedDate: string;
}

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'OUTSIDE_RADIUS' | 'IN_PROGRESS' | 'COMPLETED';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNip: string;
  position: string;
  date: string; // YYYY-MM-DD
  
  // Clock-In details
  clockInTime: string; // HH:mm:ss
  clockInIso: string;
  clockInLat: number;
  clockInLng: number;
  clockInDistanceMeters: number;
  clockInStatus: 'ON_TIME' | 'LATE' | 'OUTSIDE_RADIUS';
  clockInQrTokenUsed: string;
  clockInNotes?: string;
  
  // Clock-Out details
  clockOutTime?: string; // HH:mm:ss
  clockOutIso?: string;
  clockOutLat?: number;
  clockOutLng?: number;
  clockOutDistanceMeters?: number;
  clockOutNotes?: string;
  
  workDurationMinutes?: number;
  isVerifiedGps: boolean;
}

export interface DynamicQrPayload {
  token: string;
  storeId: string;
  storeCode: string;
  timestamp: number;
  expiresAt: number;
  otpCode: string;
  salt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO' | 'ERROR';
  timestamp: string;
  read: boolean;
  employeeName?: string;
  isOnTime?: boolean;
}

export type UserRole = 'ADMIN' | 'EMPLOYEE';
