import { Attendance } from "../models/Attendance";
import { Employee } from "../models/Employee";
import { Interview } from "../models/Interview";
import { Job } from "../models/Job";
import { Leave } from "../models/Leave";
import { Payroll } from "../models/Payroll";
import { Resume } from "../models/Resume";
import { findEmployeeByUserId } from "../utils/resolveEmployee";
import { UserRole } from "../types/auth";
import { getLeaveSummary } from "./leaveService";

export const getAdminDashboard = async () => {
  const [
    totalEmployees,
    activeEmployees,
    pendingLeaves,
    payrollRecords,
    jobsOpen,
    resumes,
    interviews,
    attendanceToday,
  ] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: "ACTIVE" }),
    Leave.countDocuments({ status: "PENDING" }),
    Payroll.find().limit(500),
    Job.countDocuments({ status: "OPEN" }),
    Resume.find().sort({ matchScore: -1 }).limit(10),
    Interview.countDocuments(),
    Attendance.countDocuments({
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    }),
  ]);

  const totalPaidOut = payrollRecords.reduce((s, p) => s + p.finalSalary, 0);
  const hiringFunnel = {
    jobsOpen,
    candidates: await Resume.countDocuments(),
    shortlisted: await Resume.countDocuments({ status: "SHORTLISTED" }),
    interviews,
  };

  const approvedLeaves = await Leave.find({ status: "APPROVED" });
  let totalUsed = 0;
  const byTypeAdmin = { CASUAL: 0, SICK: 0, ANNUAL: 0, UNPAID: 0, WFH: 0 };
  for (const l of approvedLeaves) {
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    const calculatedDays = l.days ?? (Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    if (l.type === "CASUAL" || l.type === "SICK" || l.type === "ANNUAL") {
      totalUsed += calculatedDays;
    }
    const leaveTypeStr = String(l.type) as keyof typeof byTypeAdmin;
    if (byTypeAdmin[leaveTypeStr] !== undefined) {
      byTypeAdmin[leaveTypeStr] += calculatedDays;
    }
  }

  return {
    totalEmployees,
    activeEmployees,
    pendingLeaves,
    attendanceToday,
    payroll: { totalPayslips: payrollRecords.length, totalPaidOut },
    hiringFunnel,
    topCandidates: resumes.map((r) => ({
      id: r._id,
      candidateName: r.candidateName,
      matchScore: r.matchScore,
      ranking: r.ranking,
    })),
    leaveStats: {
      totalUsed,
      byType: byTypeAdmin,
    },
    aiInsights: [
      `${await Resume.countDocuments({ ranking: "HIGH" })} high-match candidates`,
      `${pendingLeaves} leave requests awaiting approval`,
    ],
  };
};

export const getRecruiterDashboard = async () => {
  const [jobs, resumes, interviews, recentResumes] = await Promise.all([
    Job.find({ status: "OPEN" }).limit(10),
    Resume.countDocuments(),
    Interview.find().sort({ updatedAt: -1 }).limit(5),
    Resume.find().sort({ createdAt: -1 }).limit(5),
  ]);

  return {
    openJobs: jobs.length,
    jobs,
    totalCandidates: resumes,
    interviews,
    recentCandidates: recentResumes,
  };
};

export const getEmployeeDashboard = async (userId: string) => {
  const employee = await findEmployeeByUserId(userId);
  if (!employee) {
    return {
      linked: false,
      message: "Link your user account to an employee profile",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayAttendance, recentLeaves, payslips, leavePending, leaveSummary] = await Promise.all([
    Attendance.findOne({ employeeId: employee._id, date: today }),
    Leave.find({ employeeId: employee._id }).sort({ createdAt: -1 }).limit(5),
    Payroll.find({ employeeId: employee._id }).sort({ periodYear: -1, periodMonth: -1 }).limit(3),
    Leave.countDocuments({ employeeId: employee._id, status: "PENDING" }),
    getLeaveSummary(String(employee._id)),
  ]);

  return {
    linked: true,
    employee: {
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
    },
    attendance: todayAttendance
      ? {
          checkIn: todayAttendance.checkIn,
          checkOut: todayAttendance.checkOut,
          status: todayAttendance.status,
        }
      : null,
    leaves: { pending: leavePending, recent: recentLeaves },
    leaveSummary,
    payslips,
    performance: { kpiScore: 82, goalsCompleted: 3, goalsTotal: 5 },
  };
};

export const getDashboardForRole = async (role: UserRole, userId: string) => {
  if (role === "ADMIN" || role === "MANAGER") {
    return { type: "admin", data: await getAdminDashboard() };
  }
  if (role === "RECRUITER") {
    return { type: "recruiter", data: await getRecruiterDashboard() };
  }
  return { type: "employee", data: await getEmployeeDashboard(userId) };
};
