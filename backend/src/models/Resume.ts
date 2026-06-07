import mongoose, { Document, Schema, Types } from "mongoose";

export interface IResume extends Document {
  jobId: Types.ObjectId;
  candidateName: string;
  email?: string;
  fileName: string;
  extractedText: string;
  skills: string[];
  matchScore: number;
  atsScore: number;
  ranking: "HIGH" | "MEDIUM" | "LOW";
  status: "NEW" | "SHORTLISTED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    fileName: { type: String, required: true },
    extractedText: { type: String, default: "" },
    skills: [{ type: String }],
    matchScore: { type: Number, default: 0 },
    atsScore: { type: Number, default: 0 },
    ranking: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "LOW" },
    status: { type: String, enum: ["NEW", "SHORTLISTED", "REJECTED"], default: "NEW" },
  },
  { timestamps: true },
);

export const Resume = mongoose.model<IResume>("Resume", resumeSchema);
