import type { LabelHTMLAttributes, ReactNode } from 'react';
import styles from './forms.module.css';

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  hint?: string;
}

export function FormLabel({ children, hint, className, ...props }: FormLabelProps) {
  return (
    <label
      className={[styles.formLabel, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
      {hint && <span className={styles.formHint}>{hint}</span>}
    </label>
  );
}
