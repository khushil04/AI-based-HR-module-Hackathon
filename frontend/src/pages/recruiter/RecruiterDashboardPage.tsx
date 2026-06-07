import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import NotificationPanel from "../../components/common/NotificationPanel";
import { getDashboardApi } from "../../services/dashboardApi";

const RecruiterDashboardPage = () => {
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

  const recent = (data?.recentCandidates as Array<Record<string, unknown>>) ?? [];

  return (
    <AppLayout title="Recruiter Dashboard">
      <div className="grid-2">
        <section className="card card-wide">
          <h2>Recruitment</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{String(data?.openJobs ?? "—")}</span>
              <span className="stat-label">Open Jobs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{String(data?.totalCandidates ?? "—")}</span>
              <span className="stat-label">Candidates</span>
            </div>
          </div>

          <h3>Recent candidates</h3>
          <ul className="insight-list">
            {recent.length === 0 && <li>No candidates yet</li>}
            {recent.map((c) => (
              <li key={String(c._id)}>
                {String(c.candidateName)} — {String(c.matchScore)}% match
              </li>
            ))}
          </ul>

          <nav className="nav">
            <Link to="/screening">Screen Resumes</Link>
            <Link to="/interviews">Interviews</Link>
            <Link to="/employees">Employees</Link>
          </nav>
        </section>
        <NotificationPanel />
      </div>
    </AppLayout>
  );
};

export default RecruiterDashboardPage;
