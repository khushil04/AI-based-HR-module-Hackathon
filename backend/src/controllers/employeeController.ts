import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "../services/employeeService";

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const department = typeof req.query.department === "string" ? req.query.department : undefined;
    const status =
      req.query.status === "ACTIVE" || req.query.status === "INACTIVE"
        ? req.query.status
        : undefined;

    const result = await listEmployees({ page, limit, search, department, status });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await getEmployeeById(req.params.id as string);
    res.status(200).json({ employee });
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Employee not found" ? 404 : 500).json({ message });
  }
};

export const postEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, department, position, hireDate } = req.body;

    if (!firstName || !lastName || !email || !department || !position || !hireDate) {
      res.status(400).json({
        message: "firstName, lastName, email, department, position, and hireDate are required",
      });
      return;
    }

    const employee = await createEmployee(req.body);
    res.status(201).json({ employee });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const putEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employee = await updateEmployee(req.params.id as string, req.body);
    res.status(200).json({ employee });
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Employee not found" ? 404 : 400).json({ message });
  }
};

export const removeEmployee = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await deleteEmployee(req.params.id as string);
    res.status(200).json(result);
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Employee not found" ? 404 : 500).json({ message });
  }
};
