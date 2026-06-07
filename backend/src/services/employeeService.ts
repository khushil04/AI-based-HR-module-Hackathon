import { Employee, IEmployee } from "../models/Employee";

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  managerId?: string;
  hireDate: string;
  status?: "ACTIVE" | "INACTIVE";
  userId?: string;
  totalLeaves?: number;
}

interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: "ACTIVE" | "INACTIVE";
}

const formatEmployee = (employee: IEmployee) => ({
  id: employee._id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  phone: employee.phone,
  department: employee.department,
  position: employee.position,
  managerId: employee.managerId,
  hireDate: employee.hireDate,
  status: employee.status,
  userId: employee.userId,
  totalLeaves: employee.totalLeaves,
  createdAt: employee.createdAt,
  updatedAt: employee.updatedAt,
});

export const listEmployees = async (query: ListQuery) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (query.department) {
    filter.department = query.department;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.search?.trim()) {
    const term = query.search.trim();
    filter.$or = [
      { firstName: { $regex: term, $options: "i" } },
      { lastName: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
      { department: { $regex: term, $options: "i" } },
      { position: { $regex: term, $options: "i" } },
    ];
  }

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .populate("managerId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(filter),
  ]);

  return {
    employees: employees.map(formatEmployee),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getEmployeeById = async (id: string) => {
  const employee = await Employee.findById(id).populate("managerId", "firstName lastName email");
  if (!employee) {
    throw new Error("Employee not found");
  }
  return formatEmployee(employee);
};

export const createEmployee = async (input: EmployeeInput) => {
  const existing = await Employee.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw new Error("Employee with this email already exists");
  }

  const employee = await Employee.create({
    ...input,
    email: input.email.toLowerCase(),
    hireDate: new Date(input.hireDate),
  });

  return formatEmployee(employee);
};

export const updateEmployee = async (id: string, input: Partial<EmployeeInput>) => {
  if (input.email) {
    const duplicate = await Employee.findOne({
      email: input.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new Error("Another employee already uses this email");
    }
  }

  const update: Record<string, unknown> = { ...input };
  if (input.email) {
    update.email = input.email.toLowerCase();
  }
  if (input.hireDate) {
    update.hireDate = new Date(input.hireDate);
  }

  const employee = await Employee.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate("managerId", "firstName lastName email");

  if (!employee) {
    throw new Error("Employee not found");
  }

  return formatEmployee(employee);
};

export const deleteEmployee = async (id: string) => {
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    throw new Error("Employee not found");
  }
  return { message: "Employee deleted successfully" };
};
