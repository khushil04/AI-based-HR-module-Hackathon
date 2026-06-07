import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import LoadingState from "../../components/ui/LoadingState";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { getPayrollApi } from "../../services/payrollApi";
import type { EmployeeRef, PayrollRecord } from "../../types/payroll";
import { formatCurrency, monthName } from "../../utils/payroll";

const PayslipDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isEmployee = user?.role === "EMPLOYEE";

  const [payroll, setPayroll] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getPayrollApi(id);
        setPayroll(data);
      } catch {
        setError("Payslip not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const employee =
    payroll && typeof payroll.employeeId === "object"
      ? (payroll.employeeId as EmployeeRef)
      : null;

  return (
    <AppLayout title="Payslip">
      <Link to={isEmployee ? "/my-payslips" : "/payroll"} className="back-link">
        ← Back
      </Link>

      {loading && <LoadingState />}
      {error && <Alert>{error}</Alert>}

      {payroll && employee && (
        <Panel className="payslip">
          <div className="payslip-header">
            <div>
              <h2>AI-HRMS Payslip</h2>
              <p className="muted">
                {monthName(payroll.periodMonth)} {payroll.periodYear}
              </p>
            </div>
            <span className={`badge badge-${payroll.status.toLowerCase()}`}>{payroll.status}</span>
          </div>

          <dl className="profile-grid">
            <dt>Employee</dt>
            <dd>
              {employee.firstName} {employee.lastName}
            </dd>
            <dt>Email</dt>
            <dd>{employee.email}</dd>
            <dt>Department</dt>
            <dd>{employee.department}</dd>
            <dt>Position</dt>
            <dd>{employee.position}</dd>
          </dl>

          <table className="data-table payslip-table">
            <tbody>
              <tr>
                <td>Base salary</td>
                <td className="amount">{formatCurrency(payroll.baseSalary)}</td>
              </tr>
              <tr>
                <td>Bonus</td>
                <td className="amount">{formatCurrency(payroll.bonus)}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td className="amount">− {formatCurrency(payroll.tax)}</td>
              </tr>
              <tr>
                <td>Deductions</td>
                <td className="amount">− {formatCurrency(payroll.deductions)}</td>
              </tr>
              <tr className="payslip-total">
                <td>
                  <strong>Net pay</strong>
                </td>
                <td className="amount">
                  <strong>{formatCurrency(payroll.finalSalary)}</strong>
                </td>
              </tr>
            </tbody>
          </table>

          {payroll.notes && (
            <p className="muted" style={{ marginTop: 12 }}>
              Notes: {payroll.notes}
            </p>
          )}

          {canEdit && (
            <div className="form-actions" style={{ marginTop: 16 }}>
              <Link to={`/payroll/${payroll.id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                Print
              </button>
            </div>
          )}
        </Panel>
      )}
    </AppLayout>
  );
};

export default PayslipDetailPage;
