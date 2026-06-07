import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import NotificationPanel from "../../components/common/NotificationPanel";
import { getDashboardApi } from "../../services/dashboardApi";
import { formatCurrency } from "../../utils/payroll";

const AdminDashboardPage = () => {
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

  const payroll = data?.payroll as { totalPayslips: number; totalPaidOut: number } | undefined;
  const funnel = data?.hiringFunnel as Record<string, number> | undefined;
  const leaveStats = data?.leaveStats as {
    totalUsed: number;
    byType: Record<string, number>;
  } | undefined;

  return (
    <AppLayout title="Admin Dashboard">
      <div className="grid-2">
        <section className="card card-wide">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{String(data?.totalEmployees ?? "—")}</span>
              <span className="stat-label">Total Employees</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{String(data?.pendingLeaves ?? "—")}</span>
              <span className="stat-label">Pending Leaves</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{String(data?.attendanceToday ?? "—")}</span>
              <span className="stat-label">Checked In Today</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">
                {payroll ? formatCurrency(payroll.totalPaidOut) : "—"}
              </span>
              <span className="stat-label">Payroll Paid Out</span>
            </div>
          </div>

          <h3>Leave utilization</h3>
          {leaveStats ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ margin: "0.25rem 0 0.75rem 0" }} className="muted">
                Total approved standard leaves taken: <strong>{leaveStats.totalUsed} days</strong>
              </p>
              <div className="stats-grid" style={{ gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveStats.byType?.SICK ?? 0}</span>
                  <span className="stat-label">Sick Leave</span>
                </div>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveStats.byType?.CASUAL ?? 0}</span>
                  <span className="stat-label">Casual Leave</span>
                </div>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveStats.byType?.ANNUAL ?? 0}</span>
                  <span className="stat-label">Paid / Annual</span>
                </div>
                <div className="stat-card" style={{ padding: "0.75rem 1rem" }}>
                  <span className="stat-value" style={{ fontSize: "1.5rem" }}>{leaveStats.byType?.WFH ?? 0}</span>
                  <span className="stat-label">Work From Home</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="muted">No organizational leave data available.</p>
          )}

          <h3>Hiring funnel</h3>
          <ul className="insight-list">
            <li>Open jobs: {funnel?.jobsOpen ?? 0}</li>
            <li>Candidates: {funnel?.candidates ?? 0}</li>
            <li>Shortlisted: {funnel?.shortlisted ?? 0}</li>
            <li>Interviews: {funnel?.interviews ?? 0}</li>
          </ul>

          <h3>AI insights</h3>
          <ul className="insight-list">
            {((data?.aiInsights as string[]) ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <nav className="nav">
            <Link to="/employees">Employees</Link>
            <Link to="/attendance">Attendance</Link>
            <Link to="/leaves">Leaves</Link>
            <Link to="/payroll">Payroll</Link>
            <Link to="/screening">Resume Screening</Link>
          </nav>
        </section>
        <NotificationPanel />
      </div>
    </AppLayout>
  );
};

export default AdminDashboardPage;
