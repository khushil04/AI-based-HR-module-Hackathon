import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  listNotifications,
  markNotificationsRead,
} from "../services/notificationService";

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? Math.min(50, Number(req.query.limit)) : 30;
    const notifications = await listNotifications(req.user!.id, limit);
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const patchMarkRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ids = Array.isArray(req.body?.ids) ? (req.body.ids as string[]) : undefined;
    await markNotificationsRead(req.user!.id, ids);
    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
