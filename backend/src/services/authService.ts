import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Employee } from "../models/Employee";
import { IUser, User } from "../models/User";
import { UserRole } from "../types/auth";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

const sanitizeUser = (user: IUser) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const generateToken = (user: IUser): string =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new Error("User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    ...input,
    email: input.email.toLowerCase(),
    password: hashedPassword,
  });

  await ensureEmployeeProfileForUser(user);

  return { token: generateToken(user), user: sanitizeUser(user) };
};

const ensureEmployeeProfileForUser = async (user: IUser): Promise<void> => {
  const existing = await Employee.findOne({
    $or: [{ userId: user._id }, { email: user.email }],
  });
  if (existing) {
    if (!existing.userId) {
      existing.userId = user._id;
      await existing.save();
    }
    return;
  }

  const nameParts = user.name.trim().split(/\s+/);
  await Employee.create({
    firstName: nameParts[0] ?? "User",
    lastName: nameParts.slice(1).join(" ") || "User",
    email: user.email,
    department: "General",
    position: user.role === "EMPLOYEE" ? "Staff" : user.role,
    hireDate: new Date(),
    userId: user._id,
    status: "ACTIVE",
  });
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  await ensureEmployeeProfileForUser(user);

  return { token: generateToken(user), user: sanitizeUser(user) };
};
