import { api } from "../utils/api";
import type {
  AttendanceListResponse,
  AttendanceRecord,
  AttendanceReport,
  TodayStatus,
} from "../types/attendance";

export const checkInApi = async (): Promise<AttendanceRecord> => {
  const res = await api.post<{ attendance: AttendanceRecord }>("/attendance/check-in");
  return res.data.attendance;
};

export const checkOutApi = async (): Promise<AttendanceRecord> => {
  const res = await api.post<{ attendance: AttendanceRecord }>("/attendance/check-out");
  return res.data.attendance;
};

export const getTodayApi = async (): Promise<TodayStatus> => {
  const res = await api.get<TodayStatus>("/attendance/today");
  return res.data;
};

export const listAttendanceApi = async (params?: {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  status?: string;
}): Promise<AttendanceListResponse> => {
  const res = await api.get<AttendanceListResponse>("/attendance", { params });
  return res.data;
};

export const getAttendanceReportApi = async (params?: {
  from?: string;
  to?: string;
}): Promise<AttendanceReport> => {
  const res = await api.get<AttendanceReport>("/attendance/report", { params });
  return res.data;
};
