import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { getDashboardForRole } from "../services/dashboardService";

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getDashboardForRole(req.user!.role, req.user!.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
