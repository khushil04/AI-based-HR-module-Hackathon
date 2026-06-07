import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../types/auth";

interface AuthJwtPayload {
  id: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthJwtPayload;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (!token) {
    res.status(401).json({ message: "Not authorized, token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthJwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const authorizeRoles =
  (allowedRoles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: insufficient role permissions" });
      return;
    }
    next();
  };
