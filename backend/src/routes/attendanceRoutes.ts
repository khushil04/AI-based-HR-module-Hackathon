import { Router } from "express";
import {
  getAttendance,
  getReport,
  getToday,
  postCheckIn,
  postCheckOut,
} from "../controllers/attendanceController";
import { authorizeRoles, protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.post("/check-in", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), postCheckIn);
router.post("/check-out", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), postCheckOut);
router.get("/today", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), getToday);
router.get("/report", authorizeRoles(["ADMIN", "MANAGER", "RECRUITER", "EMPLOYEE"]), getReport);
router.get("/", authorizeRoles(["ADMIN", "MANAGER", "RECRUITER", "EMPLOYEE"]), getAttendance);

export default router;
