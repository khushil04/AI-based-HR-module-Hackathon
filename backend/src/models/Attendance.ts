import mongoose, { Document, Schema, Types } from "mongoose";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE";

export interface IAttendance extends Document {
  employeeId: Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE"],
      default: "PRESENT",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>("Attendance", attendanceSchema);
