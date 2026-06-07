import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { loginApi } from "../../services/authApi";
import type { UserRole } from "../../types/auth";
import RoleSelect from "../../components/ui/RoleSelect";
import { AUTH_PROFILES, getProfileByRole } from "../../constants/authProfiles";

const LoginPage = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [loginAs, setLoginAs] = useState<UserRole>("ADMIN");
  const [email, setEmail] = useState(AUTH_PROFILES[0]!.email);
  const [password, setPassword] = useState(AUTH_PROFILES[0]!.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setLoginAs(role);
    const profile = getProfileByRole(role);
    if (profile) {
      setEmail(profile.email);
      setPassword(profile.password);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      setAuth(data.token, data.user);
      navigate("/");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError("Cannot reach backend. Start it with: cd backend && npm run dev");
        } else {
          setError(String(err.response.data?.message ?? "Invalid email or password"));
        }
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = AUTH_PROFILES.map(({ role, label, description, icon }) => ({
    role,
    label,
    description,
    icon,
  }));

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-icon">◆</span>
        <h1>AI-HRMS</h1>
        <p>Intelligent workforce management</p>
        <ul className="auth-brand-features">
          <li>Role-based dashboards</li>
          <li>AI hiring & HR assistant</li>
          <li>Attendance & payroll</li>
        </ul>
      </div>
      <div className="auth-form-wrap">
        <form className="card auth-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p className="auth-subtitle">Choose who you are signing in as</p>

          <RoleSelect
            label="Sign in as"
            value={loginAs}
            options={roleOptions}
            onChange={handleRoleChange}
          />

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••"
            />
          </label>

          <p className="auth-hint">
            Demo accounts use password <code>123456</code>.{" "}
            <Link to={`/register?role=${loginAs}`}>Create this role</Link> if not registered yet.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Signing in..." : `Sign in as ${getProfileByRole(loginAs)?.label}`}
          </button>

          <p className="auth-footer-link">
            No account? <Link to={`/register?role=${loginAs}`}>Sign up as {getProfileByRole(loginAs)?.label}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
