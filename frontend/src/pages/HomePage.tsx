import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/common/AppLayout";
import NotificationPanel from "../components/common/NotificationPanel";
import { useAuth } from "../context/AuthContext";
import { getDashboardApi } from "../services/dashboardApi";
import type { UserRole } from "../types/auth";
import { formatCurrency } from "../utils/payroll";

interface QuickAction {
  title: string;
  description: string;
  to: string;
  icon: string;
  roles: UserRole[];
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "Employees",
    description: "Manage profiles and departments",
    to: "/employees",
    icon: "👥",
    roles: ["ADMIN", "MANAGER", "RECRUITER"],
  },
  {
    title: "Attendance",
    description: "Track check-ins and reports",
    to: "/attendance",
    icon: "🕐",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "My Attendance",
    description: "Check in and view history",
    to: "/my-attendance",
    icon: "✅",
    roles: ["EMPLOYEE", "ADMIN", "MANAGER"],
  },
  {
    title: "Leaves",
    description: "Requests and approvals",
    to: "/leaves",
    icon: "🌴",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
  },
  {
    title: "Payroll",
    description: "Payslips and salary runs",
    to: "/payroll",
    icon: "💰",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "My Payslips",
    description: "View your salary slips",
    to: "/my-payslips",
    icon: "📄",
    roles: ["EMPLOYEE"],
  },
  {
    title: "Resume Screening",
    description: "AI match candidates to jobs",
    to: "/screening",
    icon: "🤖",
    roles: ["ADMIN", "MANAGER", "RECRUITER"],
  },
  {
    title: "Interviews",
    description: "Voice answers and AI scoring",
    to: "/interviews",
    icon: "🎤",
    roles: ["ADMIN", "MANAGER", "RECRUITER"],
  },
  {
    title: "Admin Overview",
    description: "Company-wide analytics",
    to: "/admin",
    icon: "📊",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Recruiter Hub",
    description: "Hiring pipeline at a glance",
    to: "/recruiter",
    icon: "📋",
    roles: ["RECRUITER", "ADMIN", "MANAGER"],
  },
];

const roleLabel: Record<UserRole, string> = {
  ADMIN: "Administrator",
  MANAGER: "Senior Manager",
  RECRUITER: "HR Recruiter",
  EMPLOYEE: "Employee",
};

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardApi();
        setStats(res.data);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (!user) return null;

  const actions = QUICK_ACTIONS.filter((a) => a.roles.includes(user.role));

  const payroll = stats?.payroll as { totalPaidOut?: number } | undefined;
  const funnel = stats?.hiringFunnel as Record<string, number> | undefined;
  const perf = stats?.performance as { kpiScore?: number } | undefined;

  return (
    <AppLayout title="Dashboard">
      <section className="hero-banner">
        <div className="hero-content">
          <p className="hero-eyebrow">AI-Powered HRMS</p>
          <h2>Welcome back, {user.name.split(" ")[0]}</h2>
          <p className="hero-sub">
            Signed in as <span className="role-pill">{roleLabel[user.role]}</span>
          </p>
        </div>
        <div className="hero-date">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </section>

      {!loading && stats && (
        <div className="stats-grid home-stats">
          {user.role === "ADMIN" || user.role === "MANAGER" ? (
            <>
              <div className="stat-card stat-card-accent">
                <span className="stat-value">{String(stats.totalEmployees ?? 0)}</span>
                <span className="stat-label">Employees</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{String(stats.pendingLeaves ?? 0)}</span>
                <span className="stat-label">Pending leaves</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {payroll?.totalPaidOut != null ? formatCurrency(payroll.totalPaidOut) : "—"}
                </span>
                <span className="stat-label">Payroll paid</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{String(funnel?.candidates ?? 0)}</span>
                <span className="stat-label">Candidates</span>
              </div>
            </>
          ) : user.role === "RECRUITER" ? (
            <>
              <div className="stat-card stat-card-accent">
                <span className="stat-value">{String(stats.openJobs ?? 0)}</span>
                <span className="stat-label">Open jobs</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{String(stats.totalCandidates ?? 0)}</span>
                <span className="stat-label">Candidates</span>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card stat-card-accent">
                <span className="stat-value">{perf?.kpiScore ?? "—"}%</span>
                <span className="stat-label">KPI score</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">
                  {(stats.leaves as { pending?: number })?.pending ?? 0}
                </span>
                <span className="stat-label">Leave pending</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="home-layout">
        <div className="home-main">
          <h3 className="section-title">Quick actions</h3>
          <div className="action-grid">
            {actions.map((action) => (
              <Link key={action.to} to={action.to} className="action-card">
                <span className="action-icon">{action.icon}</span>
                <div>
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                <span className="action-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
        <aside className="home-aside">
          <NotificationPanel />
        </aside>
      </div>
    </AppLayout>
  );
};

export default HomePage;
