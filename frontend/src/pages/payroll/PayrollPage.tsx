import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Panel from "../../components/ui/Panel";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { deletePayrollApi, getPayrollReportApi, listPayrollsApi } from "../../services/payrollApi";
import type { PayrollRecord, PayrollReport } from "../../types/payroll";
import { employeeLabel } from "../../utils/format";
import { formatCurrency, monthName } from "../../utils/payroll";

const PayrollPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, reportData] = await Promise.all([
        listPayrollsApi({ page, limit: 10 }),
        getPayrollReportApi(),
      ]);
      setPayrolls(list.payrolls);
      setTotalPages(list.pagination.totalPages);
      setReport(reportData);
    } catch {
      setError("Failed to load payroll data.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this payslip?")) return;
    try {
      await deletePayrollApi(id);
      void load();
    } catch {
      setError("Only admins can delete payslips.");
    }
  };

  return (
    <AppLayout title="Payroll">
      <PageHeader
        description="Generate payslips, manage salary components, and track payouts."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate("/payroll/new")}>
            + Generate payslip
          </button>
        }
      />

      {report && (
        <div className="stats-grid">
          <StatCard icon="💰" value={formatCurrency(report.summary.totalPaidOut)} label="Total paid out" accent />
          <StatCard icon="📄" value={report.summary.totalPayslips} label="Payslips" />
          <StatCard icon="✓" value={report.summary.paid} label="Marked paid" />
          <StatCard icon="📝" value={report.summary.draft} label="Drafts" />
        </div>
      )}

      {error && <Alert>{error}</Alert>}

      <Panel title="Payslips">
        {loading ? (
          <LoadingState />
        ) : payrolls.length === 0 ? (
          <EmptyState
            icon="💵"
            title="No payslips yet"
            message="Generate your first payslip for an employee."
            action={
              <button type="button" className="btn btn-primary" onClick={() => navigate("/payroll/new")}>
                Generate payslip
              </button>
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Net pay</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{employeeLabel(p.employeeId)}</strong>
                      </td>
                      <td>
                        {monthName(p.periodMonth)} {p.periodYear}
                      </td>
                      <td>
                        <strong>{formatCurrency(p.finalSalary)}</strong>
                      </td>
                      <td>
                        <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                      </td>
                      <td className="actions">
                        <Link to={`/payroll/${p.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                        <Link to={`/payroll/${p.id}/edit`} className="btn btn-ghost btn-sm">
                          Edit
                        </Link>
                        {isAdmin && (
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Panel>
    </AppLayout>
  );
};

export default PayrollPage;
