import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createPayroll,
  deletePayroll,
  getPayrollById,
  getPayrollReport,
  listPayrolls,
  updatePayroll,
} from "../services/payrollService";

export const getPayrolls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : undefined;
    const periodMonth = req.query.periodMonth ? Number(req.query.periodMonth) : undefined;
    const periodYear = req.query.periodYear ? Number(req.query.periodYear) : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const result = await listPayrolls(req.user!.id, req.user!.role, {
      page,
      limit,
      employeeId,
      periodMonth,
      periodYear,
      status,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payroll = await getPayrollById(req.params.id as string, req.user!.id, req.user!.role);
    res.status(200).json({ payroll });
  } catch (error) {
    const message = (error as Error).message;
    const code = message === "Payslip not found" ? 404 : message === "Access denied" ? 403 : 400;
    res.status(code).json({ message });
  }
};

export const postPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, periodMonth, periodYear, baseSalary } = req.body;
    if (!employeeId || !periodMonth || !periodYear || baseSalary === undefined) {
      res.status(400).json({
        message: "employeeId, periodMonth, periodYear, and baseSalary are required",
      });
      return;
    }

    const payroll = await createPayroll(req.body);
    res.status(201).json({ payroll });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const putPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payroll = await updatePayroll(req.params.id as string, req.body);
    res.status(200).json({ payroll });
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Payslip not found" ? 404 : 400).json({ message });
  }
};

export const removePayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await deletePayroll(req.params.id as string);
    res.status(200).json(result);
  } catch (error) {
    const message = (error as Error).message;
    res.status(message === "Payslip not found" ? 404 : 500).json({ message });
  }
};

export const getReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const periodMonth = req.query.periodMonth ? Number(req.query.periodMonth) : undefined;
    const periodYear = req.query.periodYear ? Number(req.query.periodYear) : undefined;
    const report = await getPayrollReport(periodMonth, periodYear);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
