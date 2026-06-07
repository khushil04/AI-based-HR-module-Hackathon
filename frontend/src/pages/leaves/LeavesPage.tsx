import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { createLeaveApi, listLeavesApi, reviewLeaveApi, getLeaveSummaryApi } from "../../services/leaveApi";
import type { LeaveSummary } from "../../services/leaveApi";
import type { LeaveInput, LeaveRecord } from "../../types/leave";
import { employeeLabel, formatDate } from "../../utils/format";

const LeavesPage = () => {
  const { user } = useAuth();
  const canReview = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [type, setType] = useState<LeaveInput["type"]>("CASUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leavesData, summaryData] = await Promise.all([
        listLeavesApi({
          page: 1,
          limit: 20,
          status: statusFilter || undefined,
        }),
        getLeaveSummaryApi().catch(() => null)
      ]);
      setLeaves(leavesData.leaves);
      setSummary(summaryData);
    } catch {
      setError("Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createLeaveApi({ type, startDate, endDate, reason });
      setReason("");
      setStartDate("");
      setEndDate("");
      await load();
    } catch {
      setError("Failed to submit leave. Link your account to an employee profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await reviewLeaveApi(id, status);
      await load();
    } catch {
      setError("Failed to update leave status.");
    }
  };

  return (
    <AppLayout title="Leaves">
      <PageHeader
        description={
          canReview
            ? "Review team leave requests and submit your own."
            : "Request time off and track approval status."
        }
      />

      {summary && (
        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card" style={{ borderLeft: "4px solid #4f46e5" }}>
            <span className="stat-value">{summary.totalLeaves}</span>
            <span className="stat-label">Total Allocated</span>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
            <span className="stat-value">{summary.usedLeaves}</span>
            <span className="stat-label">Used Leaves</span>
          </div>
          <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
            <span className="stat-value">{summary.remainingLeaves}</span>
            <span className="stat-label">Remaining Leaves</span>
          </div>
        </div>
      )}

      <div className="grid-2-equal">
        <Panel title="Request leave">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Type
                <select value={type} onChange={(e) => setType(e.target.value as LeaveInput["type"])}>
                  <option value="CASUAL">Casual</option>
                  <option value="SICK">Sick</option>
                  <option value="ANNUAL">Annual</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="WFH">Work From Home</option>
                </select>
              </label>
              <label>
                Start date
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>
              <label>
                End date
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </label>
            </div>
            <label>
              Reason
              <input value={reason} onChange={(e) => setReason(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </form>
        </Panel>

        <Panel title="Filter requests">
          <label>
            Status
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </label>
        </Panel>
      </div>

      {error && <Alert>{error}</Alert>}

      <Panel title="Leave requests">
        {loading ? (
          <LoadingState />
        ) : leaves.length === 0 ? (
          <EmptyState icon="🌴" title="No leave requests" message="Submit a request using the form above." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {canReview && <th>Employee</th>}
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {canReview && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    {canReview && <td>{employeeLabel(leave.employeeId)}</td>}
                    <td>{leave.type}</td>
                    <td>
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                      <div className="muted" style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
                        {leave.days} {leave.days === 1 ? "day" : "days"}
                      </div>
                    </td>
                    <td>{leave.reason}</td>
                    <td>
                      <span className={`badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                    </td>
                    {canReview && (
                      <td className="actions">
                        {leave.status === "PENDING" && (
                          <>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleReview(leave.id, "APPROVED")}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReview(leave.id, "REJECTED")}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppLayout>
  );
};

export default LeavesPage;
