import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { createLeaveRequest, listLeaves, updateLeaveStatus, getLeaveSummary } from "../services/leaveService";
import { getUserIdForEmployee, resolveEmployeeId } from "../utils/resolveEmployee";
import { pushNotification } from "../services/notificationService";

export const postLeave = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!type || !startDate || !endDate || !reason) {
      res.status(400).json({ message: "type, startDate, endDate, and reason are required" });
      return;
    }

    const leave = await createLeaveRequest(req.user!.id, req.user!.role, req.body);
    const submitter = await User.findById(req.user!.id);
    const typeLabel = String(type).toLowerCase().replace("_", " ");
    await pushNotification(
      { roles: ["ADMIN", "MANAGER"] },
      {
        type: "new_leave_request",
        message: `${submitter?.name ?? "An employee"} submitted a ${typeLabel} leave request`,
        leaveId: leave.id,
        leaveType: type,
      },
    );
    res.status(201).json({ leave });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getLeaves = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : undefined;

    const result = await listLeaves(req.user!.id, req.user!.role, {
      page,
      limit,
      status,
      employeeId,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const patchLeaveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, reviewNote } = req.body;
    if (status !== "APPROVED" && status !== "REJECTED") {
      res.status(400).json({ message: "status must be APPROVED or REJECTED" });
      return;
    }

    const leave = await updateLeaveStatus(
      req.params.id as string,
      req.user!.id,
      status,
      reviewNote,
    );

    const employeeUserId = await getUserIdForEmployee(String(leave.employeeId));
    if (employeeUserId) {
      const decision = status === "APPROVED" ? "approved" : "rejected";
      await pushNotification(
        { userIds: [employeeUserId] },
        {
          type: status === "APPROVED" ? "leave_approved" : "leave_rejected",
          message: `Your ${leave.type.toLowerCase()} leave request was ${decision}.`,
          leaveId: leave.id,
          status,
        },
      );
    }

    res.status(200).json({ leave });
  } catch (error) {
    const message = (error as Error).message;
    res.status(message.includes("not found") ? 404 : 400).json({ message });
  }
};

export const getLeaveSummaryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : undefined;
    const employee = await resolveEmployeeId(req.user!.id, req.user!.role, employeeId);
    const summary = await getLeaveSummary(String(employee._id));
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
