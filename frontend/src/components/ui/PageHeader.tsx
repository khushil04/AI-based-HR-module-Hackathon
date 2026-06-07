import type { ReactNode } from "react";

interface PageHeaderProps {
  description?: string;
  actions?: ReactNode;
}

const PageHeader = ({ description, actions }: PageHeaderProps) => (
  <div className="page-header">
    <div>
      {description && <p className="page-description">{description}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>
);

export default PageHeader;
