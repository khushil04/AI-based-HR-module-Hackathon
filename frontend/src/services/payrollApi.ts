import { api } from "../utils/api";
import type {
  PayrollInput,
  PayrollListResponse,
  PayrollRecord,
  PayrollReport,
} from "../types/payroll";

export const listPayrollsApi = async (params?: {
  page?: number;
  limit?: number;
  periodMonth?: number;
  periodYear?: number;
  status?: string;
  employeeId?: string;
}): Promise<PayrollListResponse> => {
  const res = await api.get<PayrollListResponse>("/payroll", { params });
  return res.data;
};

export const getPayrollApi = async (id: string): Promise<PayrollRecord> => {
  const res = await api.get<{ payroll: PayrollRecord }>(`/payroll/${id}`);
  return res.data.payroll;
};

export const createPayrollApi = async (data: PayrollInput): Promise<PayrollRecord> => {
  const res = await api.post<{ payroll: PayrollRecord }>("/payroll", data);
  return res.data.payroll;
};

export const updatePayrollApi = async (
  id: string,
  data: Partial<PayrollInput>,
): Promise<PayrollRecord> => {
  const res = await api.put<{ payroll: PayrollRecord }>(`/payroll/${id}`, data);
  return res.data.payroll;
};

export const deletePayrollApi = async (id: string): Promise<void> => {
  await api.delete(`/payroll/${id}`);
};

export const getPayrollReportApi = async (params?: {
  periodMonth?: number;
  periodYear?: number;
}): Promise<PayrollReport> => {
  const res = await api.get<PayrollReport>("/payroll/report", { params });
  return res.data;
};
