import { api } from "../utils/api";
import type { LeaveInput, LeaveListResponse, LeaveRecord } from "../types/leave";

export const listLeavesApi = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<LeaveListResponse> => {
  const res = await api.get<LeaveListResponse>("/leaves", { params });
  return res.data;
};

export const createLeaveApi = async (data: LeaveInput): Promise<LeaveRecord> => {
  const res = await api.post<{ leave: LeaveRecord }>("/leaves", data);
  return res.data.leave;
};

export const reviewLeaveApi = async (
  id: string,
  status: "APPROVED" | "REJECTED",
  reviewNote?: string,
): Promise<LeaveRecord> => {
  const res = await api.patch<{ leave: LeaveRecord }>(`/leaves/${id}/status`, {
    status,
    reviewNote,
  });
  return res.data.leave;
};

export interface LeaveSummary {
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  byType: Record<string, number>;
}

export const getLeaveSummaryApi = async (employeeId?: string): Promise<LeaveSummary> => {
  const res = await api.get<LeaveSummary>("/leaves/summary", { params: { employeeId } });
  return res.data;
};
