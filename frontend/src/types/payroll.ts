export type PayrollStatus = "DRAFT" | "PROCESSED" | "PAID";

export interface EmployeeRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: EmployeeRef | string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  bonus: number;
  tax: number;
  deductions: number;
  finalSalary: number;
  status: PayrollStatus;
  notes?: string;
  createdAt?: string;
}

export interface PayrollInput {
  employeeId: string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  bonus?: number;
  tax?: number;
  deductions?: number;
  status?: PayrollStatus;
  notes?: string;
}

export interface PayrollListResponse {
  payrolls: PayrollRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface PayrollReport {
  summary: {
    totalPayslips: number;
    totalBaseSalary: number;
    totalBonus: number;
    totalTax: number;
    totalDeductions: number;
    totalPaidOut: number;
    draft: number;
    processed: number;
    paid: number;
  };
}
