export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface ManagerRef {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  managerId?: ManagerRef | string;
  hireDate: string;
  status: EmployeeStatus;
  userId?: string;
  totalLeaves?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  managerId?: string;
  hireDate: string;
  status?: EmployeeStatus;
  totalLeaves?: number;
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
