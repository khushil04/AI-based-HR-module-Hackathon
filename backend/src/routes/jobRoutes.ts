import { Router } from "express";
import { getJobs, postJob } from "../controllers/jobController";
import { authorizeRoles, protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);
router.get("/", authorizeRoles(["ADMIN", "MANAGER", "RECRUITER"]), getJobs);
router.post("/", authorizeRoles(["ADMIN", "MANAGER", "RECRUITER"]), postJob);

export default router;
