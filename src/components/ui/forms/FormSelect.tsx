import type { ReactNode, SelectHTMLAttributes } from 'react';
import styles from './forms.module.css';
import { FormLabel } from './FormLabel';

export interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: FormSelectOption[];
  placeholder?: string;
}

export function FormSelect({
  label,
  hint,
  error,
  options,
  placeholder,
  id,
  className,
  ...props
}: FormSelectProps) {
  const selectId = id ?? (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const select = (
    <select
      id={selectId}
      className={[
        styles.formSelect,
        error ? styles.formInputError : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-invalid={error ? true : undefined}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (!label) return select;

  return (
    <div className={styles.formField}>
      <FormLabel htmlFor={selectId}>{label as ReactNode}</FormLabel>
      {select}
      {error && <span className={styles.formError}>{error}</span>}
      {!error && hint && <span className={styles.formHint}>{hint}</span>}
    </div>
  );
}
