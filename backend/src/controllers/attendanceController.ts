import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  checkIn,
  checkOut,
  getAttendanceReport,
  getTodayStatus,
  listAttendance,
} from "../services/attendanceService";
import { pushNotification } from "../services/notificationService";

export const postCheckIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employeeId =
      typeof req.body?.employeeId === "string" ? req.body.employeeId : undefined;
    const record = await checkIn(req.user!.id, req.user!.role, employeeId);
    await pushNotification(
      { roles: ["ADMIN", "MANAGER"] },
      { type: "attendance_update", message: "Employee checked in" },
    );
    res.status(200).json({ attendance: record });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const postCheckOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employeeId =
      typeof req.body?.employeeId === "string" ? req.body.employeeId : undefined;
    const record = await checkOut(req.user!.id, req.user!.role, employeeId);
    res.status(200).json({ attendance: record });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : undefined;
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const result = await listAttendance(req.user!.id, req.user!.role, {
      page,
      limit,
      employeeId,
      from,
      to,
      status,
    });
    res.status(200).json(result);
  } catch (error) {
    const message = (error as Error).message;
    const code = message.includes("not found") || message.includes("linked") ? 400 : 500;
    res.status(code).json({ message });
  }
};

export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    const report = await getAttendanceReport(req.user!.id, req.user!.role, from, to);
    res.status(200).json(report);
  } catch (error) {
    const message = (error as Error).message;
    res.status(500).json({ message });
  }
};

export const getToday = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = await getTodayStatus(req.user!.id, req.user!.role);
    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
