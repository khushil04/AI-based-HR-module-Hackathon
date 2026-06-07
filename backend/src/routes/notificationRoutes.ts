import { Router } from "express";
import { getNotifications, patchMarkRead } from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);
router.get("/", getNotifications);
router.patch("/read", patchMarkRead);

export default router;
