import { useEffect, useRef, useState } from "react";
import type { UserRole } from "../../types/auth";

export interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  icon: string;
}

interface RoleSelectProps {
  label: string;
  value: UserRole;
  options: RoleOption[];
  onChange: (role: UserRole) => void;
}

const RoleSelect = ({ label, value, options, onChange }: RoleSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.role === value) ?? options[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="role-select-wrap" ref={ref}>
      <span className="role-select-label">{label}</span>
      <button
        type="button"
        className={`role-select-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="role-select-trigger-icon">{selected?.icon}</span>
        <span className="role-select-trigger-text">
          <strong>{selected?.label}</strong>
          <small>{selected?.description}</small>
        </span>
        <span className="role-select-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <ul className="role-select-menu" role="listbox">
          {options.map((option) => (
            <li key={option.role}>
              <button
                type="button"
                role="option"
                aria-selected={option.role === value}
                className={`role-select-option ${option.role === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(option.role);
                  setOpen(false);
                }}
              >
                <span className="role-option-icon">{option.icon}</span>
                <span className="role-option-body">
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                {option.role === value && <span className="role-option-check">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoleSelect;
