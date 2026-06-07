import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import NotificationPanel from "../../components/common/NotificationPanel";
import { getDashboardApi } from "../../services/dashboardApi";
import { formatCurrency } from "../../utils/payroll";

const EmployeeDashboardPage = () => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardApi();
        setData(res.data);
      } catch {
        setData(null);
      }
    };
    void load();
  }, []);

  const employee = data?.employee as { name: string; department: string } | undefined;
  const attendance = data?.attendance as { checkIn?: string; checkOut?: string } | null;
  const perf = data?.performance as { kpiScore: number; goalsCompleted: number; goalsTotal: number };
  const payslips = (data?.payslips as Array<{ finalSalary: number; periodMonth: number }>) ?? [];
  const leaveSummary = data?.leaveSummary as {
    totalLeaves: number;
    usedLeaves: number;
    remainingLeaves: number;
    byType: Record<string, number>;
  } | undefined;
  const leavePending = (data?.leaves as { pending?: number })?.pending ?? 0;

  if (data?.linked === false) {
    return (
      <AppLayout title="Employee Dashboard">
        <p className="error">{String(data.message)}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Employee Dashboard">
      <div className="grid-2">
        <section className="card card-wide">
          <h2>Welcome, {employee?.name}</h2>
          <p className="muted">{employee?.department}</p>

          <h3>Today&apos;s attendance</h3>
          <p>
            {attendance?.checkIn
              ? `Checked in. Check-out: ${attendance.checkOut ? "done" : "pending"}`
              : "Not checked in yet"}
          </p>

          <h3>Performance</h3>
          <p>
            KPI: {perf?.kpiScore ?? "—"}% · Goals: {perf?.goalsCompleted}/{perf?.goalsTotal}
          </p>

          <h3>Leave Balance Summary</h3>
          {leaveSummary ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="stats-grid" style={{ marginBottom: "1.5rem", marginTop: "0.5rem" }}>
                <div className="stat-card" style={{ borderLeft: "4px solid #4f46e5" }}>
                  <span className="stat-value">{leaveSummary.totalLeaves}</span>
                  <span className="stat-label">Total Allocated</span>
                </div>
                <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
                  <span className="stat-value">{leaveSummary.usedLeaves}</span>
                  <span className="stat-label">Used Leaves</span>
                </div>
                <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
                  <span className="stat-value">{leaveSummary.remainingLeaves}</span>
                  <span className="stat-label">Remaining Leaves</span>
                </div>
                <div className="stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
                  <span className="stat-value">{leavePending}</span>
                  <span className="stat-label">Pending Leaves</span>
                </div>
              </div>
              
              <h4>Approved Leaves by Category</h4>
              <div className="stats-grid" style={{ gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveSummary.byType?.SICK ?? 0}</span>
                  <span className="stat-label">Sick Leave</span>
                </div>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveSummary.byType?.CASUAL ?? 0}</span>
                  <span className="stat-label">Casual Leave</span>
                </div>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveSummary.byType?.ANNUAL ?? 0}</span>
                  <span className="stat-label">Paid / Annual</span>
                </div>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveSummary.byType?.WFH ?? 0}</span>
                  <span className="stat-label">Work From Home</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">No leave data available.</p>
          )}

          <h3>Recent payslips</h3>
          <ul className="insight-list">
            {payslips.length === 0 && <li>No payslips yet</li>}
            {payslips.map((p, i) => (
              <li key={i}>
                Month {p.periodMonth}: {formatCurrency(p.finalSalary)}
              </li>
            ))}
          </ul>

          <nav className="nav">
            <Link to="/my-attendance">Attendance</Link>
            <Link to="/leaves">Leaves</Link>
            <Link to="/my-payslips">Payslips</Link>
          </nav>
        </section>
        <NotificationPanel />
      </div>
    </AppLayout>
  );
};

export default EmployeeDashboardPage;
