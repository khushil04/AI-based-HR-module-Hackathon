import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Interview } from "../models/Interview";
import { Job } from "../models/Job";
import { Resume } from "../models/Resume";
import {
  chatWithAI,
  evaluateAnswerAI,
  screenResumeWithAI,
  uploadInterviewAnswerAI,
} from "../services/aiClient";
import { pushNotification } from "../services/notificationService";

export const screenResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "PDF file is required" });
      return;
    }

    const { jobId, candidateName, email } = req.body;
    if (!jobId || !candidateName) {
      res.status(400).json({ message: "jobId and candidateName are required" });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    const aiResult = await screenResumeWithAI(
      req.file.buffer,
      req.file.originalname,
      job.description,
      candidateName,
    );

    const resume = await Resume.create({
      jobId,
      candidateName,
      email,
      fileName: req.file.originalname,
      extractedText: aiResult.extractedText,
      skills: aiResult.skills,
      matchScore: aiResult.matchScore,
      atsScore: aiResult.atsScore,
      ranking: aiResult.ranking,
    });

    await pushNotification(
      { roles: ["ADMIN", "MANAGER", "RECRUITER"] },
      {
        type: "new_candidate",
        message: `New candidate screened: ${candidateName} (${aiResult.matchScore}% match)`,
        resumeId: resume._id,
      },
    );

    res.status(201).json({ resume });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  const jobId = typeof req.query.jobId === "string" ? req.query.jobId : undefined;
  const filter = jobId ? { jobId } : {};
  const resumes = await Resume.find(filter)
    .populate("jobId", "title department")
    .sort({ matchScore: -1 });
  res.status(200).json({ resumes });
};

export const uploadAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviewId =
      typeof req.body?.interviewId === "string" ? req.body.interviewId.trim() : "";
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    const transcript =
      typeof req.body?.transcript === "string" ? req.body.transcript.trim() : "";

    if (!interviewId || !question) {
      res.status(400).json({
        message:
          "interviewId and question are required. Schedule an interview first, then upload audio or paste a transcript.",
      });
      return;
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    let answerText = transcript;
    if (req.file) {
      const uploaded = await uploadInterviewAnswerAI(
        req.file.buffer,
        req.file.originalname,
        question,
        transcript || undefined,
      );
      answerText = uploaded.transcript?.trim() ?? answerText;
    }

    if (!answerText.trim()) {
      res.status(400).json({
        message: "Provide a voice file or paste your answer in the transcript field.",
      });
      return;
    }

    interview.status = "IN_PROGRESS";
    interview.answers.push({
      question,
      transcript: answerText,
      score: 0,
      feedback: "",
    });
    await interview.save();

    res.status(200).json({
      interviewId: interview._id,
      question,
      transcript: answerText,
    });
  } catch (error) {
    const message = (error as Error).message;
    const isClient =
      message.includes("required") ||
      message.includes("ECONNREFUSED") ||
      message.includes("connect");
    res.status(isClient ? 400 : 500).json({
      message: message.includes("ECONNREFUSED")
        ? "AI service is not running. Start it on port 8000 (uvicorn) or paste a transcript instead."
        : message,
    });
  }
};

export const evaluateAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { interviewId, question, answer } = req.body;
    if (!question || !answer) {
      res.status(400).json({ message: "question and answer are required" });
      return;
    }

    const evaluation = await evaluateAnswerAI(question, answer);

    if (interviewId) {
      const interview = await Interview.findById(interviewId);
      if (interview) {
        const idx = interview.answers.findIndex((a) => a.question === question);
        if (idx >= 0) {
          interview.answers[idx].score = evaluation.score;
          interview.answers[idx].feedback = evaluation.feedback;
          interview.answers[idx].transcript = answer;
        } else {
          interview.answers.push({
            question,
            transcript: answer,
            score: evaluation.score,
            feedback: evaluation.feedback,
          });
        }
        const scores = interview.answers.map((a) => a.score).filter((s) => s > 0);
        interview.overallScore =
          scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        interview.status = "COMPLETED";
        await interview.save();

        await pushNotification(
          { roles: ["ADMIN", "RECRUITER"] },
          {
            type: "interview_completed",
            message: `Interview completed for ${interview.candidateName}`,
            interviewId: interview._id,
          },
        );
      }
    }

    res.status(200).json({ evaluation });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const postChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, context } = req.body;
    if (!message) {
      res.status(400).json({ message: "message is required" });
      return;
    }
    const ctx =
      context ??
      `User role: ${req.user?.role}. Help with HR policies and platform usage.`;
    const { reply } = await chatWithAI(message, ctx);
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const createInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { candidateName, jobId, resumeId } = req.body;
  if (!candidateName) {
    res.status(400).json({ message: "candidateName is required" });
    return;
  }
  const interview = await Interview.create({ candidateName, jobId, resumeId, status: "SCHEDULED" });

  await pushNotification(
    { roles: ["ADMIN", "RECRUITER"] },
    {
      type: "interview_scheduled",
      message: `Interview scheduled for ${candidateName}`,
      interviewId: interview._id,
    },
  );

  res.status(201).json({ interview });
};

export const getInterviews = async (_req: AuthRequest, res: Response): Promise<void> => {
  const interviews = await Interview.find()
    .populate("jobId", "title")
    .sort({ updatedAt: -1 });
  res.status(200).json({ interviews });
};
