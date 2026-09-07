export type AttendanceStatus = 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'ABSENT' | 'FIELD_WORK' | 'ON_LEAVE';
export type LeaveType = 'ANNUAL' | 'HALF_AM' | 'HALF_PM' | 'SPECIAL' | 'FIELD_WORK' | 'OVERTIME';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  department: string;
  position: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm:ss
  checkOut?: string; // HH:mm:ss
  status: AttendanceStatus;
  ipAddress?: string;
  location?: string;
  workHours?: number; // 계산된 근무시간 (h)
  note?: string;
}

export interface LeaveApplication {
  id: string;
  userId: string;
  userName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: number;
  reason: string;
  status: ApprovalStatus;
  approverName?: string;
  appliedAt: string;
}