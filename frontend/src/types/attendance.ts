export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE";

export interface EmployeeRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: EmployeeRef | string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceListResponse {
  attendance: AttendanceRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AttendanceReport {
  summary: {
    totalRecords: number;
    present: number;
    absent: number;
    halfDay: number;
    onLeave: number;
    withCheckIn: number;
    withCheckOut: number;
  };
  byDepartment: { _id: string; count: number; present: number }[];
}

export interface TodayStatus {
  employee: { id: string; name: string };
  today: AttendanceRecord | null;
}
