import { Payroll, IPayroll } from "../models/Payroll";
import { UserRole } from "../types/auth";
import { calculateFinalSalary } from "../utils/payrollCalc";
import { findEmployeeByUserId } from "../utils/resolveEmployee";

export interface PayrollInput {
  employeeId: string;
  periodMonth: number;
  periodYear: number;
  baseSalary: number;
  bonus?: number;
  tax?: number;
  deductions?: number;
  status?: "DRAFT" | "PROCESSED" | "PAID";
  notes?: string;
}

const formatPayroll = (record: IPayroll) => ({
  id: record._id,
  employeeId: record.employeeId,
  periodMonth: record.periodMonth,
  periodYear: record.periodYear,
  baseSalary: record.baseSalary,
  bonus: record.bonus,
  tax: record.tax,
  deductions: record.deductions,
  finalSalary: record.finalSalary,
  status: record.status,
  notes: record.notes,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

interface ListQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  periodMonth?: number;
  periodYear?: number;
  status?: string;
}

export const listPayrolls = async (userId: string, role: UserRole, query: ListQuery) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (role === "EMPLOYEE") {
    const employee = await findEmployeeByUserId(userId);
    if (!employee) {
      throw new Error("No employee profile linked to your account. Contact HR.");
    }
    filter.employeeId = employee._id;
  } else if (query.employeeId) {
    filter.employeeId = query.employeeId;
  }

  if (query.periodMonth) filter.periodMonth = query.periodMonth;
  if (query.periodYear) filter.periodYear = query.periodYear;
  if (query.status) filter.status = query.status;

  const [records, total] = await Promise.all([
    Payroll.find(filter)
      .populate("employeeId", "firstName lastName email department position")
      .sort({ periodYear: -1, periodMonth: -1 })
      .skip(skip)
      .limit(limit),
    Payroll.countDocuments(filter),
  ]);

  return {
    payrolls: records.map(formatPayroll),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const getPayrollById = async (id: string, userId: string, role: UserRole) => {
  const record = await Payroll.findById(id).populate(
    "employeeId",
    "firstName lastName email department position",
  );
  if (!record) {
    throw new Error("Payslip not found");
  }

  if (role === "EMPLOYEE") {
    const employee = await findEmployeeByUserId(userId);
    const recordEmployeeId =
      typeof record.employeeId === "object" && record.employeeId && "_id" in record.employeeId
        ? String((record.employeeId as { _id: unknown })._id)
        : String(record.employeeId);
    if (!employee || recordEmployeeId !== String(employee._id)) {
      throw new Error("Access denied");
    }
  }

  return formatPayroll(record);
};

export const createPayroll = async (input: PayrollInput) => {
  const bonus = input.bonus ?? 0;
  const tax = input.tax ?? 0;
  const deductions = input.deductions ?? 0;
  const finalSalary = calculateFinalSalary(input.baseSalary, bonus, tax, deductions);

  const existing = await Payroll.findOne({
    employeeId: input.employeeId,
    periodMonth: input.periodMonth,
    periodYear: input.periodYear,
  });
  if (existing) {
    throw new Error("Payslip already exists for this employee and period");
  }

  const record = await Payroll.create({
    ...input,
    bonus,
    tax,
    deductions,
    finalSalary,
    status: input.status ?? "DRAFT",
  });

  return formatPayroll(record);
};

export const updatePayroll = async (id: string, input: Partial<PayrollInput>) => {
  const record = await Payroll.findById(id);
  if (!record) {
    throw new Error("Payslip not found");
  }

  if (input.baseSalary !== undefined) record.baseSalary = input.baseSalary;
  if (input.bonus !== undefined) record.bonus = input.bonus;
  if (input.tax !== undefined) record.tax = input.tax;
  if (input.deductions !== undefined) record.deductions = input.deductions;
  if (input.status !== undefined) record.status = input.status;
  if (input.notes !== undefined) record.notes = input.notes;

  record.finalSalary = calculateFinalSalary(
    record.baseSalary,
    record.bonus,
    record.tax,
    record.deductions,
  );

  await record.save();
  return formatPayroll(record);
};

export const deletePayroll = async (id: string) => {
  const record = await Payroll.findByIdAndDelete(id);
  if (!record) {
    throw new Error("Payslip not found");
  }
  return { message: "Payslip deleted successfully" };
};

export const getPayrollReport = async (periodMonth?: number, periodYear?: number) => {
  const filter: Record<string, unknown> = {};
  if (periodMonth) filter.periodMonth = periodMonth;
  if (periodYear) filter.periodYear = periodYear;

  const records = await Payroll.find(filter);

  const summary = {
    totalPayslips: records.length,
    totalBaseSalary: records.reduce((sum, r) => sum + r.baseSalary, 0),
    totalBonus: records.reduce((sum, r) => sum + r.bonus, 0),
    totalTax: records.reduce((sum, r) => sum + r.tax, 0),
    totalDeductions: records.reduce((sum, r) => sum + r.deductions, 0),
    totalPaidOut: records.reduce((sum, r) => sum + r.finalSalary, 0),
    draft: records.filter((r) => r.status === "DRAFT").length,
    processed: records.filter((r) => r.status === "PROCESSED").length,
    paid: records.filter((r) => r.status === "PAID").length,
  };

  return { summary };
};
