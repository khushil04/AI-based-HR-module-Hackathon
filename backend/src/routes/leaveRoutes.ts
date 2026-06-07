import { Router } from "express";
import { getLeaves, patchLeaveStatus, postLeave, getLeaveSummaryController } from "../controllers/leaveController";
import { authorizeRoles, protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/summary", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), getLeaveSummaryController);
router.get("/", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), getLeaves);
router.post("/", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), postLeave);
router.patch("/:id/status", authorizeRoles(["ADMIN", "MANAGER"]), patchLeaveStatus);

export default router;
