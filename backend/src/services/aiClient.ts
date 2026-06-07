import axios from "axios";
import FormData from "form-data";
import { env } from "../config/env";

const ai = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 120000,
});

export const screenResumeWithAI = async (
  fileBuffer: Buffer,
  fileName: string,
  jobDescription: string,
  candidateName: string,
) => {
  const form = new FormData();
  form.append("file", fileBuffer, { filename: fileName, contentType: "application/pdf" });
  form.append("job_description", jobDescription);
  form.append("candidate_name", candidateName);

  const res = await ai.post("/resume/screen", form, {
    headers: form.getHeaders(),
  });
  return res.data as {
    extractedText: string;
    skills: string[];
    matchScore: number;
    atsScore: number;
    ranking: "HIGH" | "MEDIUM" | "LOW";
  };
};

export const uploadInterviewAnswerAI = async (
  fileBuffer: Buffer,
  fileName: string,
  question: string,
  transcript?: string,
) => {
  const form = new FormData();
  form.append("file", fileBuffer, { filename: fileName });
  form.append("question", question);
  if (transcript) form.append("transcript", transcript);

  const res = await ai.post("/interview/upload-answer", form, {
    headers: form.getHeaders(),
  });
  return res.data as { question: string; transcript: string };
};

export const evaluateAnswerAI = async (question: string, answer: string) => {
  const res = await ai.post("/interview/evaluate-answer", {
    question,
    answer,
    role: "candidate",
  });
  return res.data as {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
};

export const chatWithAI = async (message: string, context: string) => {
  const res = await ai.post("/chat", { message, context });
  return res.data as { reply: string };
};
