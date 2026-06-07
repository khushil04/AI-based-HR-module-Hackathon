import { Router } from "express";
import {
  getPayroll,
  getPayrolls,
  getReport,
  postPayroll,
  putPayroll,
  removePayroll,
} from "../controllers/payrollController";
import { authorizeRoles, protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/report", authorizeRoles(["ADMIN", "MANAGER"]), getReport);
router.get("/", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), getPayrolls);
router.get("/:id", authorizeRoles(["ADMIN", "MANAGER", "EMPLOYEE"]), getPayroll);
router.post("/", authorizeRoles(["ADMIN", "MANAGER"]), postPayroll);
router.put("/:id", authorizeRoles(["ADMIN", "MANAGER"]), putPayroll);
router.delete("/:id", authorizeRoles(["ADMIN"]), removePayroll);

export default router;
