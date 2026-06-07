interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  accent?: boolean;
}

const StatCard = ({ value, label, icon, accent }: StatCardProps) => (
  <div className={`stat-card ${accent ? "stat-card-accent" : ""}`}>
    {icon && <span className="stat-icon">{icon}</span>}
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

export default StatCard;
