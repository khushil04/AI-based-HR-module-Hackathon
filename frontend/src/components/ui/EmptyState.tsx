import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: ReactNode;
}

const EmptyState = ({ icon = "📭", title, message, action }: EmptyStateProps) => (
  <div className="empty-state">
    <span className="empty-icon">{icon}</span>
    <h4>{title}</h4>
    {message && <p>{message}</p>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);

export default EmptyState;
