import mongoose, { Document, Schema } from "mongoose";
import { UserRole } from "../types/auth";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "RECRUITER", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
