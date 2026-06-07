export type LeaveType = "CASUAL" | "SICK" | "ANNUAL" | "UNPAID" | "WFH";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface EmployeeRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: EmployeeRef | string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewNote?: string;
  createdAt?: string;
}

export interface LeaveListResponse {
  leaves: LeaveRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface LeaveInput {
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
