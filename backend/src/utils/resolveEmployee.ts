import { Types } from "mongoose";
import { Employee, IEmployee } from "../models/Employee";
import { User } from "../models/User";

/** Resolve the login User id for an employee profile (for targeted notifications). */
export const getUserIdForEmployee = async (
  employeeId: Types.ObjectId | string,
): Promise<string | null> => {
  const employee = await Employee.findById(employeeId);
  if (!employee) return null;

  if (employee.userId) {
    return String(employee.userId);
  }

  const user = await User.findOne({ email: employee.email.toLowerCase() });
  if (!user) return null;

  employee.userId = user._id as Types.ObjectId;
  await employee.save();
  return String(user._id);
};
import { UserRole } from "../types/auth";

export const findEmployeeByUserId = async (userId: string): Promise<IEmployee | null> =>
  Employee.findOne({ userId });

export const startOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Inclusive start, exclusive end — reliable "today" queries in MongoDB */
export const getDayRange = (date: Date = new Date()) => {
  const start = startOfDay(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

/**
 * Ensures every user who needs self-service HR features has an employee record.
 * Links by userId, matches by email, or auto-creates a profile.
 */
export const ensureEmployeeForUser = async (userId: string): Promise<IEmployee> => {
  let employee = await Employee.findOne({ userId });

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!employee) {
    employee = await Employee.findOne({ email: user.email.toLowerCase() });
    if (employee) {
      employee.userId = user._id as Types.ObjectId;
      await employee.save();
      return employee;
    }
  } else {
    return employee;
  }

  const nameParts = user.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "User";
  const lastName = nameParts.slice(1).join(" ") || "User";

  employee = await Employee.create({
    firstName,
    lastName,
    email: user.email.toLowerCase(),
    department: "General",
    position: user.role === "EMPLOYEE" ? "Staff" : user.role,
    hireDate: new Date(),
    userId: user._id,
    status: "ACTIVE",
  });

  return employee;
};

export const resolveEmployeeId = async (
  userId: string,
  role: UserRole,
  requestedEmployeeId?: string,
): Promise<IEmployee> => {
  if (requestedEmployeeId && (role === "ADMIN" || role === "MANAGER")) {
    const employee = await Employee.findById(requestedEmployeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee;
  }

  return ensureEmployeeForUser(userId);
};
