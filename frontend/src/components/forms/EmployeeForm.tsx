import { useState } from "react";
import type { FormEvent } from "react";
import type { Employee, EmployeeInput } from "../../types/employee";

interface EmployeeFormProps {
  initial?: Employee;
  onSubmit: (data: EmployeeInput) => Promise<void>;
  onCancel: () => void;
}

const EmployeeForm = ({ initial, onSubmit, onCancel }: EmployeeFormProps) => {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [hireDate, setHireDate] = useState(
    initial?.hireDate ? new Date(initial.hireDate).toISOString().slice(0, 10) : "",
  );
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(initial?.status ?? "ACTIVE");
  const [totalLeaves, setTotalLeaves] = useState<number>(initial?.totalLeaves ?? 20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        department,
        position,
        hireDate,
        status,
        totalLeaves,
      });
    } catch {
      setError("Failed to save employee. Check your permissions and input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          First name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Department
          <input value={department} onChange={(e) => setDepartment(e.target.value)} required />
        </label>
        <label>
          Position
          <input value={position} onChange={(e) => setPosition(e.target.value)} required />
        </label>
        <label>
          Hire date
          <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} required />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label>
          Total Leave Allocation
          <input type="number" value={totalLeaves} onChange={(e) => setTotalLeaves(Number(e.target.value))} required min="0" />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update Employee" : "Create Employee"}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
