import { api } from "../utils/api";

export interface ScreenResult {
  resume: {
    id: string;
    candidateName: string;
    matchScore: number;
    atsScore: number;
    ranking: string;
    skills: string[];
    extractedText: string;
  };
}

export const screenResumeApi = async (formData: FormData) => {
  const res = await api.post<ScreenResult>("/ai/screen-resume", formData);
  return res.data;
};

export const listResumesApi = async (jobId?: string) => {
  const res = await api.get("/ai/resumes", { params: jobId ? { jobId } : {} });
  return res.data.resumes as Array<Record<string, unknown>>;
};

export const listJobsApi = async () => {
  const res = await api.get("/jobs");
  return res.data.jobs as Array<{
    _id: string;
    title: string;
    description: string;
    department: string;
    status: string;
  }>;
};

export const createJobApi = async (data: {
  title: string;
  description: string;
  department: string;
}) => {
  const res = await api.post("/jobs", data);
  return res.data.job;
};

export const uploadAnswerApi = async (formData: FormData) => {
  const res = await api.post("/ai/upload-answer", formData);
  return res.data as { interviewId: string; question: string; transcript: string };
};

export const evaluateAnswerApi = async (data: {
  interviewId?: string;
  question: string;
  answer: string;
}) => {
  const res = await api.post("/ai/evaluate-answer", data);
  return res.data.evaluation as {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
};

export const chatApi = async (message: string, context?: string) => {
  const res = await api.post("/ai/chat", { message, context });
  return res.data.reply as string;
};

export const createInterviewApi = async (data: {
  candidateName: string;
  jobId?: string;
  resumeId?: string;
}) => {
  const res = await api.post("/ai/interviews", data);
  return res.data.interview as { _id: string; candidateName: string };
};

export const listInterviewsApi = async () => {
  const res = await api.get("/ai/interviews");
  return res.data.interviews as Array<Record<string, unknown>>;
};
