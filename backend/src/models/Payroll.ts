import mongoose, { Document, Schema, Types } from "mongoose";

export type PayrollStatus = "DRAFT" | "PROCESSED" | "PAID";

export interface IPayroll extends Document {
  employeeId: Types.ObjectId;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  bonus: number;
  tax: number;
  deductions: number;
  finalSalary: number;
  status: PayrollStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const payrollSchema = new Schema<IPayroll>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    periodMonth: { type: Number, required: true, min: 1, max: 12 },
    periodYear: { type: Number, required: true, min: 2000 },
    baseSalary: { type: Number, required: true, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    finalSalary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["DRAFT", "PROCESSED", "PAID"], default: "DRAFT" },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

payrollSchema.index({ employeeId: 1, periodMonth: 1, periodYear: 1 }, { unique: true });

export const Payroll = mongoose.model<IPayroll>("Payroll", payrollSchema);
