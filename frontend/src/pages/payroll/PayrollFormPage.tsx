import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/common/AppLayout";
import PayrollForm from "../../components/forms/PayrollForm";
import { createPayrollApi, getPayrollApi, updatePayrollApi } from "../../services/payrollApi";
import type { PayrollInput, PayrollRecord } from "../../types/payroll";

const PayrollFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [payroll, setPayroll] = useState<PayrollRecord | null>(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getPayrollApi(id);
        setPayroll(data);
      } catch {
        navigate("/payroll");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate]);

  const handleSubmit = async (data: PayrollInput) => {
    if (isEdit && id) {
      await updatePayrollApi(id, data);
      navigate(`/payroll/${id}`);
    } else {
      const created = await createPayrollApi(data);
      navigate(`/payroll/${created.id}`);
    }
  };

  return (
    <AppLayout title={isEdit ? "Edit Payslip" : "Generate Payslip"}>
      <Link to={isEdit && id ? `/payroll/${id}` : "/payroll"} className="back-link">
        ← Cancel
      </Link>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <PayrollForm
          initial={payroll ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate(isEdit && id ? `/payroll/${id}` : "/payroll")}
        />
      )}
    </AppLayout>
  );
};

export default PayrollFormPage;
