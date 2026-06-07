type AlertVariant = "error" | "success" | "info";

const Alert = ({ variant = "error", children }: { variant?: AlertVariant; children: string }) => (
  <div className={`alert alert-${variant}`} role="alert">
    {children}
  </div>
);

export default Alert;
