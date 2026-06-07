import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerApi } from "../../services/authApi";
import type { UserRole } from "../../types/auth";
import axios from "axios";
import RoleSelect from "../../components/ui/RoleSelect";
import { AUTH_PROFILES, getProfileByRole } from "../../constants/authProfiles";

const RegisterPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get("role") as UserRole) || "EMPLOYEE";
  const initialProfile = getProfileByRole(initialRole) ?? AUTH_PROFILES[3]!;

  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialProfile.email);
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const profile = getProfileByRole(role);
    if (profile && !name) {
      setEmail(profile.email);
    }
  }, [role, name]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    const profile = getProfileByRole(newRole);
    if (profile) {
      setEmail(profile.email);
      if (!name) {
        setName(profile.label.split(" ")[0] ?? "User");
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await registerApi(name, email, password, role);
      setAuth(data.token, data.user);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(String(err.response.data.message));
      } else {
        setError("Registration failed. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = AUTH_PROFILES.map(({ role: r, label, description, icon }) => ({
    role: r,
    label,
    description,
    icon,
  }));

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-icon">◆</span>
        <h1>AI-HRMS</h1>
        <p>Create your workspace account</p>
        <ul className="auth-brand-features">
          <li>Pick your role in the organization</li>
          <li>One account per email</li>
          <li>Secure JWT authentication</li>
        </ul>
      </div>
      <div className="auth-form-wrap">
        <form className="card auth-card" onSubmit={handleSubmit}>
          <h2>Create account</h2>
          <p className="auth-subtitle">Select the type of account you need</p>

          <RoleSelect
            label="Sign up as"
            value={role}
            options={roleOptions}
            onChange={handleRoleChange}
          />

          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating..." : `Create ${getProfileByRole(role)?.label} account`}
          </button>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
