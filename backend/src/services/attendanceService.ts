import { Types } from "mongoose";
import { Attendance, IAttendance } from "../models/Attendance";
import { UserRole } from "../types/auth";
import { ensureEmployeeForUser, getDayRange, resolveEmployeeId } from "../utils/resolveEmployee";

const formatAttendance = (record: IAttendance) => ({
  id: record._id,
  employeeId: record.employeeId,
  date: record.date,
  checkIn: record.checkIn,
  checkOut: record.checkOut,
  status: record.status,
  notes: record.notes,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const findTodayRecord = async (employeeId: Types.ObjectId) => {
  const { start, end } = getDayRange();
  return Attendance.findOne({
    employeeId,
    date: { $gte: start, $lt: end },
  });
};

export const checkIn = async (userId: string, role: UserRole, employeeId?: string) => {
  const employee = await resolveEmployeeId(userId, role, employeeId);
  const { start } = getDayRange();

  let record = await findTodayRecord(employee._id);

  if (record?.checkIn) {
    throw new Error("Already checked in for today");
  }

  try {
    if (!record) {
      record = await Attendance.create({
        employeeId: employee._id,
        date: start,
        checkIn: new Date(),
        status: "PRESENT",
      });
    } else {
      record.checkIn = new Date();
      record.status = "PRESENT";
      await record.save();
    }
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("duplicate key")) {
      record = await findTodayRecord(employee._id);
      if (record?.checkIn) {
        throw new Error("Already checked in for today");
      }
      if (record) {
        record.checkIn = new Date();
        record.status = "PRESENT";
        await record.save();
      }
    } else {
      throw err;
    }
  }

  if (!record) {
    throw new Error("Failed to create attendance record");
  }

  return formatAttendance(record);
};

export const checkOut = async (userId: string, role: UserRole, employeeId?: string) => {
  const employee = await resolveEmployeeId(userId, role, employeeId);

  const record = await findTodayRecord(employee._id);
  if (!record?.checkIn) {
    throw new Error("You must check in before checking out");
  }
  if (record.checkOut) {
    throw new Error("Already checked out for today");
  }

  record.checkOut = new Date();
  await record.save();

  return formatAttendance(record);
};

interface ListQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  from?: string;
  to?: string;
  status?: string;
}

export const listAttendance = async (
  userId: string,
  role: UserRole,
  query: ListQuery,
) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  if (role === "EMPLOYEE") {
    const employee = await ensureEmployeeForUser(userId);
    filter.employeeId = employee._id;
  } else if (query.employeeId) {
    filter.employeeId = query.employeeId;
  }

  if (query.status) {
    filter.status = query.status;
  }
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) {
      (filter.date as Record<string, Date>).$gte = getDayRange(new Date(query.from)).start;
    }
    if (query.to) {
      const { end } = getDayRange(new Date(query.to));
      (filter.date as Record<string, Date>).$lt = end;
    }
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate("employeeId", "firstName lastName email department")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return {
    attendance: records.map(formatAttendance),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

export const getAttendanceReport = async (
  userId: string,
  role: UserRole,
  from?: string,
  to?: string,
) => {
  const filter: Record<string, unknown> = {};

  if (role === "EMPLOYEE") {
    const employee = await ensureEmployeeForUser(userId);
    filter.employeeId = employee._id;
  }

  if (from || to) {
    filter.date = {};
    if (from) {
      (filter.date as Record<string, Date>).$gte = getDayRange(new Date(from)).start;
    }
    if (to) {
      const { end } = getDayRange(new Date(to));
      (filter.date as Record<string, Date>).$lt = end;
    }
  }

  const records = await Attendance.find(filter);

  const summary = {
    totalRecords: records.length,
    present: records.filter((r) => r.status === "PRESENT").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    halfDay: records.filter((r) => r.status === "HALF_DAY").length,
    onLeave: records.filter((r) => r.status === "ON_LEAVE").length,
    withCheckIn: records.filter((r) => r.checkIn).length,
    withCheckOut: records.filter((r) => r.checkOut).length,
  };

  const byDepartment =
    role === "EMPLOYEE"
      ? []
      : await Attendance.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "employees",
              localField: "employeeId",
              foreignField: "_id",
              as: "employee",
            },
          },
          { $unwind: "$employee" },
          {
            $group: {
              _id: "$employee.department",
              count: { $sum: 1 },
              present: {
                $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] },
              },
            },
          },
          { $sort: { count: -1 } },
        ]);

  return { summary, byDepartment };
};

export const getTodayStatus = async (userId: string, role: UserRole) => {
  const employee = await ensureEmployeeForUser(userId);
  const record = await findTodayRecord(employee._id);
  return {
    employee: {
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
    },
    today: record ? formatAttendance(record) : null,
  };
};
