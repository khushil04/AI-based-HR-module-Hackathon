import { Router } from "express";
import {
  getEmployee,
  getEmployees,
  postEmployee,
  putEmployee,
  removeEmployee,
} from "../controllers/employeeController";
import { authorizeRoles, protect } from "../middleware/authMiddleware";

const router = Router();

const readRoles = ["ADMIN", "MANAGER", "RECRUITER"] as const;
const writeRoles = ["ADMIN", "MANAGER"] as const;

router.use(protect);

router.get("/", authorizeRoles([...readRoles]), getEmployees);
router.get("/:id", authorizeRoles([...readRoles]), getEmployee);
router.post("/", authorizeRoles([...writeRoles]), postEmployee);
router.put("/:id", authorizeRoles([...writeRoles]), putEmployee);
router.delete("/:id", authorizeRoles([...writeRoles]), removeEmployee);

export default router;
