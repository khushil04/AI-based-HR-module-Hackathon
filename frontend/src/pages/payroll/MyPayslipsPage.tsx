import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { listPayrollsApi } from "../../services/payrollApi";
import type { PayrollRecord } from "../../types/payroll";
import { formatCurrency, monthName } from "../../utils/payroll";

const MyPayslipsPage = () => {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPayrollsApi({ page: 1, limit: 24 });
      setPayrolls(data.payrolls);
    } catch {
      setError("Could not load payslips. Ensure your account is linked to an employee profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppLayout title="My Payslips">
      <PageHeader description="View and download your salary slips." />
      {error && <Alert>{error}</Alert>}
      <Panel>
        {loading ? (
          <LoadingState />
        ) : payrolls.length === 0 ? (
          <EmptyState icon="📄" title="No payslips yet" message="HR will publish payslips here when ready." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Net pay</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>
                        {monthName(p.periodMonth)} {p.periodYear}
                      </strong>
                    </td>
                    <td>{formatCurrency(p.finalSalary)}</td>
                    <td>
                      <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                    </td>
                    <td>
                      <Link to={`/payroll/${p.id}`} className="btn btn-ghost btn-sm">
                        View payslip
                      </Link>
                    </td>
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

export default MyPayslipsPage;
