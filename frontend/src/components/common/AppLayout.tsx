import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import type { UserRole } from "../../types/auth";

interface AppLayoutProps {
  title: string;
  children: ReactNode;
}

interface NavItem {
  label: string;
  to: string;
  icon: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: "⌂", roles: ["ADMIN", "MANAGER", "RECRUITER", "EMPLOYEE"] },
  { label: "Employees", to: "/employees", icon: "👥", roles: ["ADMIN", "MANAGER", "RECRUITER"] },
  { label: "Attendance", to: "/attendance", icon: "🕐", roles: ["ADMIN", "MANAGER"] },
  { label: "My Attendance", to: "/my-attendance", icon: "✅", roles: ["EMPLOYEE"] },
  { label: "Leaves", to: "/leaves", icon: "🌴", roles: ["ADMIN", "MANAGER", "EMPLOYEE"] },
  { label: "Payroll", to: "/payroll", icon: "💰", roles: ["ADMIN", "MANAGER"] },
  { label: "My Payslips", to: "/my-payslips", icon: "📄", roles: ["EMPLOYEE"] },
  { label: "Screening", to: "/screening", icon: "🤖", roles: ["ADMIN", "MANAGER", "RECRUITER"] },
  { label: "Interviews", to: "/interviews", icon: "🎤", roles: ["ADMIN", "MANAGER", "RECRUITER"] },
];

const AppLayout = ({ title, children }: AppLayoutProps) => {
  const { user, logout } = useAuth();
  const { notifications, connected, clearNotifications, refreshNotifications } = useSocket();
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">◆</span>
          <div>
            <strong>AI-HRMS</strong>
            <small>Smart workforce</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${location.pathname === item.to ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="sidebar-user">
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button type="button" className="btn-logout" onClick={handleLogout} title="Logout">
              ⎋
            </button>
          </div>
        )}
      </aside>

      <div className="app-content">
        <header className="topbar">
          <h1>{title}</h1>
          <div className="topbar-actions">
            <div className="notif-dropdown">
              <button
                type="button"
                className="btn btn-ghost notif-bell"
                onClick={() => {
                  setShowNotifs((v) => !v);
                  if (!showNotifs) void refreshNotifications();
                }}
                aria-expanded={showNotifs}
                title={
                  connected
                    ? "Live — real-time alerts enabled"
                    : "Connecting… stay logged in on this tab"
                }
              >
                <span aria-hidden>🔔</span>
                {notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length}</span>
                )}
                <span className={`status-dot ${connected ? "online" : "offline"}`} />
              </button>
              {showNotifs && (
                <div className="notif-popover panel">
                  <div className="notifications-header">
                    <strong>Notifications</strong>
                    {notifications.length > 0 && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={clearNotifications}>
                        Clear
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="muted" style={{ margin: "8px 0 0" }}>
                      {connected ? "No new notifications" : "Connecting…"}
                    </p>
                  ) : (
                    <ul className="notification-list">
                      {notifications.map((n) => (
                        <li key={n.id}>
                          <span className="notif-type">{n.type.replace(/_/g, " ")}</span>
                          <p>{n.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
