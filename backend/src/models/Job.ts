import mongoose, { Document, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  description: string;
  department: string;
  status: "OPEN" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    department: { type: String, required: true, trim: true },
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
  },
  { timestamps: true },
);

export const Job = mongoose.model<IJob>("Job", jobSchema);
