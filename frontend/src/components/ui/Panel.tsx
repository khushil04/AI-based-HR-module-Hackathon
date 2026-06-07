import type { ReactNode } from "react";

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

const Panel = ({ title, children, className = "" }: PanelProps) => (
  <section className={`panel ${className}`.trim()}>
    {title && <h3 className="panel-title">{title}</h3>}
    {children}
  </section>
);

export default Panel;
