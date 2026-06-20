import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './forms.module.css';
import { FormLabel } from './FormLabel';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  type?: 'text' | 'date' | 'time' | 'number' | 'email' | 'password';
}

export function FormInput({
  label,
  hint,
  id,
  className,
  ...props
}: FormInputProps) {
  const inputId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const field = (
    <input
      id={inputId}
      className={[styles.formInput, className].filter(Boolean).join(' ')}
      {...props}
    />
  );

  if (!label) return field;

  return (
    <div className={styles.formField}>
      <FormLabel htmlFor={inputId}>{label as ReactNode}</FormLabel>
      {field}
      {hint && <span className={styles.formHint}>{hint}</span>}
    </div>
  );
}
