import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { listEmployeesApi } from "../../services/employeeApi";
import type { Employee } from "../../types/employee";
import type { PayrollInput, PayrollRecord } from "../../types/payroll";
import { calculateFinalSalary, formatCurrency } from "../../utils/payroll";

interface PayrollFormProps {
  initial?: PayrollRecord;
  onSubmit: (data: PayrollInput) => Promise<void>;
  onCancel: () => void;
}

const PayrollForm = ({ initial, onSubmit, onCancel }: PayrollFormProps) => {
  const now = new Date();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState(
    typeof initial?.employeeId === "object" ? initial.employeeId._id : (initial?.employeeId ?? ""),
  );
  const [periodMonth, setPeriodMonth] = useState(initial?.periodMonth ?? now.getMonth() + 1);
  const [periodYear, setPeriodYear] = useState(initial?.periodYear ?? now.getFullYear());
  const [baseSalary, setBaseSalary] = useState(String(initial?.baseSalary ?? ""));
  const [bonus, setBonus] = useState(String(initial?.bonus ?? 0));
  const [tax, setTax] = useState(String(initial?.tax ?? 0));
  const [deductions, setDeductions] = useState(String(initial?.deductions ?? 0));
  const [status, setStatus] = useState<PayrollInput["status"]>(initial?.status ?? "DRAFT");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = calculateFinalSalary(
    Number(baseSalary) || 0,
    Number(bonus) || 0,
    Number(tax) || 0,
    Number(deductions) || 0,
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listEmployeesApi({ limit: 100, status: "ACTIVE" });
        setEmployees(data.employees);
      } catch {
        setError("Could not load employees.");
      }
    };
    void load();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        employeeId,
        periodMonth,
        periodYear,
        baseSalary: Number(baseSalary),
        bonus: Number(bonus) || 0,
        tax: Number(tax) || 0,
        deductions: Number(deductions) || 0,
        status,
        notes: notes || undefined,
      });
    } catch {
      setError("Failed to save payslip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Employee
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            disabled={Boolean(initial)}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} — {emp.department}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month
          <select
            value={periodMonth}
            onChange={(e) => setPeriodMonth(Number(e.target.value))}
            disabled={Boolean(initial)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year
          <input
            type="number"
            min={2000}
            value={periodYear}
            onChange={(e) => setPeriodYear(Number(e.target.value))}
            required
            disabled={Boolean(initial)}
          />
        </label>
        <label>
          Base salary
          <input
            type="number"
            min={0}
            step="0.01"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            required
          />
        </label>
        <label>
          Bonus
          <input type="number" min={0} step="0.01" value={bonus} onChange={(e) => setBonus(e.target.value)} />
        </label>
        <label>
          Tax
          <input type="number" min={0} step="0.01" value={tax} onChange={(e) => setTax(e.target.value)} />
        </label>
        <label>
          Deductions
          <input
            type="number"
            min={0}
            step="0.01"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as PayrollInput["status"])}>
            <option value="DRAFT">Draft</option>
            <option value="PROCESSED">Processed</option>
            <option value="PAID">Paid</option>
          </select>
        </label>
      </div>
      <label>
        Notes
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <p className="payslip-preview">
        Net pay (preview): <strong>{formatCurrency(preview)}</strong>
      </p>

      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update Payslip" : "Generate Payslip"}
        </button>
      </div>
    </form>
  );
};

export default PayrollForm;
