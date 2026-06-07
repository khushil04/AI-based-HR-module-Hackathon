import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import Alert from "../../components/ui/Alert";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import Pagination from "../../components/ui/Pagination";
import Panel from "../../components/ui/Panel";
import { useAuth } from "../../context/AuthContext";
import { deleteEmployeeApi, listEmployeesApi } from "../../services/employeeApi";
import type { Employee } from "../../types/employee";

const EmployeesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEmployeesApi({ page, limit: 10, search: search || undefined });
      setEmployees(data.employees);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    void fetchEmployees();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this employee record?")) return;
    try {
      await deleteEmployeeApi(id);
      void fetchEmployees();
    } catch {
      setError("Failed to delete employee.");
    }
  };

  return (
    <AppLayout title="Employees">
      <PageHeader
        description="Manage employee profiles, departments, and hierarchy."
        actions={
          canWrite ? (
            <button type="button" className="btn btn-primary" onClick={() => navigate("/employees/new")}>
              + Add employee
            </button>
          ) : undefined
        }
      />

      <div className="toolbar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
      </div>

      {error && <Alert>{error}</Alert>}

      <Panel>
        {loading ? (
          <LoadingState />
        ) : employees.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No employees found"
            message={search ? "Try a different search term." : "Add your first employee to get started."}
            action={
              canWrite ? (
                <button type="button" className="btn btn-primary" onClick={() => navigate("/employees/new")}>
                  Add employee
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <strong>
                          {emp.firstName} {emp.lastName}
                        </strong>
                      </td>
                      <td>{emp.email}</td>
                      <td>{emp.department}</td>
                      <td>{emp.position}</td>
                      <td>
                        <span className={`badge badge-${emp.status.toLowerCase()}`}>{emp.status}</span>
                      </td>
                      <td className="actions">
                        <Link to={`/employees/${emp.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
                        {canWrite && (
                          <>
                            <Link to={`/employees/${emp.id}/edit`} className="btn btn-ghost btn-sm">
                              Edit
                            </Link>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(emp.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          </>
        )}
      </Panel>
    </AppLayout>
  );
};

export default EmployeesPage;
