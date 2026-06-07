import { Router, Request, Response, NextFunction } from "express";
import {
  createInterview,
  evaluateAnswer,
  getInterviews,
  getResumes,
  postChat,
  screenResume,
  uploadAnswer,
} from "../controllers/aiController";
import { authorizeRoles, protect } from "../middleware/authMiddleware";
import { audioUpload, pdfUpload } from "../middleware/upload";

const router = Router();

const handleUploadError = (err: Error, _req: Request, res: Response, next: NextFunction): void => {
  if (err) {
    res.status(400).json({ message: err.message });
    return;
  }
  next();
};

const aiRoles = ["ADMIN", "MANAGER", "RECRUITER"] as const;

router.use(protect);

router.post(
  "/screen-resume",
  authorizeRoles([...aiRoles]),
  pdfUpload.single("file"),
  screenResume,
);
router.get("/resumes", authorizeRoles([...aiRoles]), getResumes);
router.post(
  "/upload-answer",
  authorizeRoles([...aiRoles]),
  (req, res, next) => {
    audioUpload.single("file")(req, res, (err) => {
      if (err) {
        handleUploadError(err, req, res, next);
        return;
      }
      next();
    });
  },
  uploadAnswer,
);
router.post("/evaluate-answer", authorizeRoles([...aiRoles, "EMPLOYEE"]), evaluateAnswer);
router.post("/chat", authorizeRoles(["ADMIN", "MANAGER", "RECRUITER", "EMPLOYEE"]), postChat);
router.post("/interviews", authorizeRoles([...aiRoles]), createInterview);
router.get("/interviews", authorizeRoles([...aiRoles]), getInterviews);

export default router;
