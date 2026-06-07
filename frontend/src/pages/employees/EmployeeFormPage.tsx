import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import EmployeeForm from "../../components/forms/EmployeeForm";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import { createEmployeeApi, getEmployeeApi, updateEmployeeApi } from "../../services/employeeApi";
import type { Employee, EmployeeInput } from "../../types/employee";

const EmployeeFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getEmployeeApi(id);
        setEmployee(data);
      } catch {
        navigate("/employees");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate]);

  const handleSubmit = async (data: EmployeeInput) => {
    if (isEdit && id) {
      await updateEmployeeApi(id, data);
      navigate(`/employees/${id}`);
    } else {
      const created = await createEmployeeApi(data);
      navigate(`/employees/${created.id}`);
    }
  };

  return (
    <AppLayout title={isEdit ? "Edit Employee" : "New Employee"}>
      <PageHeader description={isEdit ? "Update employee information." : "Add a new employee to the system."} />
      <Link to={isEdit && id ? `/employees/${id}` : "/employees"} className="back-link">
        ← Back
      </Link>
      {loading ? (
        <LoadingState />
      ) : (
        <EmployeeForm
          initial={employee ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit && id ? `/employees/${id}` : "/employees")}
        />
      )}
    </AppLayout>
  );
};

export default EmployeeFormPage;
