import mongoose, { Document, Schema, Types } from "mongoose";

export type EmployeeStatus = "ACTIVE" | "INACTIVE";

export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  managerId?: Types.ObjectId;
  hireDate: Date;
  status: EmployeeStatus;
  userId?: Types.ObjectId;
  totalLeaves?: number;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    managerId: { type: Schema.Types.ObjectId, ref: "Employee" },
    hireDate: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    totalLeaves: { type: Number, default: 20 },
  },
  { timestamps: true },
);

employeeSchema.index({ firstName: "text", lastName: "text", email: "text", department: "text" });

export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
