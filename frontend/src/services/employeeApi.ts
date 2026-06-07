import { api } from "../utils/api";
import type { Employee, EmployeeInput, EmployeeListResponse } from "../types/employee";

export interface ListEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export const listEmployeesApi = async (
  params: ListEmployeesParams = {},
): Promise<EmployeeListResponse> => {
  const response = await api.get<EmployeeListResponse>("/employees", { params });
  return response.data;
};

export const getEmployeeApi = async (id: string): Promise<Employee> => {
  const response = await api.get<{ employee: Employee }>(`/employees/${id}`);
  return response.data.employee;
};

export const createEmployeeApi = async (data: EmployeeInput): Promise<Employee> => {
  const response = await api.post<{ employee: Employee }>("/employees", data);
  return response.data.employee;
};

export const updateEmployeeApi = async (
  id: string,
  data: Partial<EmployeeInput>,
): Promise<Employee> => {
  const response = await api.put<{ employee: Employee }>(`/employees/${id}`, data);
  return response.data.employee;
};

export const deleteEmployeeApi = async (id: string): Promise<void> => {
  await api.delete(`/employees/${id}`);
};
