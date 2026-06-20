import type { SelectHTMLAttributes } from 'react';
import styles from './ui.module.css';

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: FilterSelectOption[];
}

export function FilterSelect({ options, className, ...props }: FilterSelectProps) {
  return (
    <select className={[styles.filterSelect, className].filter(Boolean).join(' ')} {...props}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
