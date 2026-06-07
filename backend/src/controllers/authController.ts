import { Request, Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import { loginUser, registerUser } from "../services/authService";
import { UserRole } from "../types/auth";

const allowedRoles: UserRole[] = ["ADMIN", "MANAGER", "RECRUITER", "EMPLOYEE"];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "Name, email, and password are required" });
      return;
    }

    const normalizedRole = (role ?? "EMPLOYEE") as UserRole;
    if (!allowedRoles.includes(normalizedRole)) {
      res.status(400).json({ message: "Invalid role value" });
      return;
    }

    const result = await registerUser({ name, email, password, role: normalizedRole });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
};

export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch {
    res.status(500).json({ message: "Failed to fetch current user" });
  }
};
