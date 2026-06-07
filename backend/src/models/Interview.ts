import mongoose, { Document, Schema, Types } from "mongoose";

export interface IInterviewAnswer {
  question: string;
  transcript: string;
  score: number;
  feedback: string;
}

export interface IInterview extends Document {
  jobId?: Types.ObjectId;
  resumeId?: Types.ObjectId;
  candidateName: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  answers: IInterviewAnswer[];
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IInterviewAnswer>(
  {
    question: { type: String, required: true },
    transcript: { type: String, required: true },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { _id: false },
);

const interviewSchema = new Schema<IInterview>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
    candidateName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"],
      default: "SCHEDULED",
    },
    answers: [answerSchema],
    overallScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Interview = mongoose.model<IInterview>("Interview", interviewSchema);
