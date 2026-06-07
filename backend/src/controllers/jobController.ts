import { Request, Response } from "express";
import { Job } from "../models/Job";

export const getJobs = async (_req: Request, res: Response): Promise<void> => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.status(200).json({ jobs });
};

export const postJob = async (req: Request, res: Response): Promise<void> => {
  const { title, description, department, status } = req.body;
  if (!title || !description || !department) {
    res.status(400).json({ message: "title, description, and department are required" });
    return;
  }
  const job = await Job.create({ title, description, department, status });
  res.status(201).json({ job });
};
