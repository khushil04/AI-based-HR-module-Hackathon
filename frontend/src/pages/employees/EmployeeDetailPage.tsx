import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { getEmployeeApi } from "../../services/employeeApi";
import type { Employee, ManagerRef } from "../../types/employee";

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const managerName = (managerId?: Employee["managerId"]) => {
  if (!managerId || typeof managerId === "string") return "—";
  const m = managerId as ManagerRef;
  return `${m.firstName} ${m.lastName}`;
};

const EmployeeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getEmployeeApi(id);
        setEmployee(data);
      } catch {
        setError("Employee not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  return (
    <AppLayout title="Employee Profile">
      <Link to="/employees" className="back-link">
        ← Back to list
      </Link>

      <PageHeader
        description="Employee profile and employment details."
        actions={
          canWrite && employee ? (
            <button type="button" className="btn btn-primary" onClick={() => navigate(`/employees/${employee.id}/edit`)}>
              Edit profile
            </button>
          ) : undefined
        }
      />

      {loading && <LoadingState />}
      {error && <Alert>{error}</Alert>}

      {employee && (
        <Panel>
          <div className="profile-header">
            <h2>
              {employee.firstName} {employee.lastName}
            </h2>
            <span className={`badge badge-${employee.status.toLowerCase()}`}>{employee.status}</span>
          </div>
          <dl className="profile-grid">
            <dt>Email</dt>
            <dd>{employee.email}</dd>
            <dt>Phone</dt>
            <dd>{employee.phone || "—"}</dd>
            <dt>Department</dt>
            <dd>{employee.department}</dd>
            <dt>Position</dt>
            <dd>{employee.position}</dd>
            <dt>Manager</dt>
            <dd>{managerName(employee.managerId)}</dd>
            <dt>Hire date</dt>
            <dd>{formatDate(employee.hireDate)}</dd>
            <dt>Total Leave Allocation</dt>
            <dd>{employee.totalLeaves ?? 20} days</dd>
          </dl>
        </Panel>
      )}
    </AppLayout>
  );
};

export default EmployeeDetailPage;
