import { Types } from "mongoose";
import { Leave, ILeave } from "../models/Leave";
import { Employee } from "../models/Employee";
import { UserRole } from "../types/auth";
import { resolveEmployeeId } from "../utils/resolveEmployee";

export interface LeaveInput {
  type: "CASUAL" | "SICK" | "ANNUAL" | "UNPAID" | "WFH";
  startDate: string;
  endDate: string;
  reason: string;
  employeeId?: string;
}

const formatLeave = (leave: ILeave) => {
  const start = new Date(leave.startDate);
  const end = new Date(leave.endDate);
  const calculatedDays = leave.days ?? (Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  return {
    id: leave._id,
    employeeId: leave.employeeId,
    type: leave.type,
    startDate: leave.startDate,
    endDate: leave.endDate,
    days: calculatedDays,
    reason: leave.reason,
    status: leave.status,
    reviewedBy: leave.reviewedBy,
    reviewedAt: leave.reviewedAt,
    reviewNote: leave.reviewNote,
    createdAt: leave.createdAt,
    updatedAt: leave.updatedAt,
  };
};

export const createLeaveRequest = async (
  userId: string,
  role: UserRole,
  input: LeaveInput,
) => {
  const employee = await resolveEmployeeId(userId, role, input.employeeId);

  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (endDate < startDate) {
    throw new Error("End date must be on or after start date");
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const leave = await Leave.create({
    employeeId: employee._id,
    type: input.type,
    startDate,
    endDate,
    days,
    reason: input.reason,
    status: "PENDING",
  });

  return formatLeave(leave);
};

interface ListQuery {
  page?: number;
  limit?: number;
  status?: string;
  employeeId?: string;
}

export const listLeaves = async (userId: string, role: UserRole, query: ListQuery) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (role === "EMPLOYEE") {
    const employee = await resolveEmployeeId(userId, role);
    filter.employeeId = employee._id;
  } else if (query.employeeId) {
    filter.employeeId = query.employeeId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate("employeeId", "firstName lastName email department")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);

  return {
    leaves: leaves.map(formatLeave),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const updateLeaveStatus = async (
  leaveId: string,
  reviewerId: string,
  status: "APPROVED" | "REJECTED",
  reviewNote?: string,
) => {
  const leave = await Leave.findById(leaveId);
  if (!leave) {
    throw new Error("Leave request not found");
  }
  if (leave.status !== "PENDING") {
    throw new Error("Leave request has already been reviewed");
  }

  leave.status = status;
  leave.reviewedBy = new Types.ObjectId(reviewerId);
  leave.reviewedAt = new Date();
  leave.reviewNote = reviewNote;
  await leave.save();

  return formatLeave(leave);
};

export const getLeaveSummary = async (employeeId: string) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  const totalLeaves = employee.totalLeaves ?? 20;

  const leaves = await Leave.find({
    employeeId: new Types.ObjectId(employeeId),
    status: "APPROVED",
  });

  let usedLeaves = 0;
  const byType: Record<string, number> = {
    CASUAL: 0,
    SICK: 0,
    ANNUAL: 0,
    UNPAID: 0,
    WFH: 0,
  };

  for (const leave of leaves) {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const calculatedDays = leave.days ?? (Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    if (leave.type === "CASUAL" || leave.type === "SICK" || leave.type === "ANNUAL") {
      usedLeaves += calculatedDays;
    }

    if (byType[leave.type] !== undefined) {
      byType[leave.type] += calculatedDays;
    }
  }

  const remainingLeaves = Math.max(0, totalLeaves - usedLeaves);

  return {
    totalLeaves,
    usedLeaves,
    remainingLeaves,
    byType,
  };
};
