/**
 * Select Component
 */

import { type SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function Select({
  options,
  value,
  onChange,
  label,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label className="text-sm text-[var(--color-text-muted)]">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

