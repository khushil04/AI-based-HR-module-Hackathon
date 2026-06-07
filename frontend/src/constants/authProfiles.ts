import type { UserRole } from "../types/auth";

export interface AuthProfile {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
  email: string;
  password: string;
}

export const AUTH_PROFILES: AuthProfile[] = [
  {
    role: "ADMIN",
    label: "Administrator",
    description: "Full access — employees, payroll, AI tools",
    icon: "👑",
    email: "khushilshingari04@gmail.com",
    password: "123456",
  },
  {
    role: "MANAGER",
    label: "Senior Manager",
    description: "Approvals, attendance, payroll, reports",
    icon: "📊",
    email: "manager@hrms.com",
    password: "123456",
  },
  {
    role: "RECRUITER",
    label: "HR Recruiter",
    description: "Jobs, resume screening, interviews",
    icon: "🎯",
    email: "recruiter@hrms.com",
    password: "123456",
  },
  {
    role: "EMPLOYEE",
    label: "Employee",
    description: "Attendance, leaves, payslips",
    icon: "👤",
    email: "employee@hrms.com",
    password: "123456",
  },
];

export const getProfileByRole = (role: UserRole) =>
  AUTH_PROFILES.find((p) => p.role === role);
