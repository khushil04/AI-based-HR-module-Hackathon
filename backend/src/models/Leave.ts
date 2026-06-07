import mongoose, { Document, Schema, Types } from "mongoose";

export type LeaveType = "CASUAL" | "SICK" | "ANNUAL" | "UNPAID" | "WFH";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ILeave extends Document {
  employeeId: Types.ObjectId;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveSchema = new Schema<ILeave>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: ["CASUAL", "SICK", "ANNUAL", "UNPAID", "WFH"], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true },
  },
  { timestamps: true },
);

export const Leave = mongoose.model<ILeave>("Leave", leaveSchema);
