import type { ReactNode, TextareaHTMLAttributes } from 'react';
import styles from './forms.module.css';
import { FormLabel } from './FormLabel';

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function FormTextarea({
  label,
  hint,
  error,
  id,
  className,
  ...props
}: FormTextareaProps) {
  const textareaId =
    id ?? (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const textarea = (
    <textarea
      id={textareaId}
      className={[
        styles.formTextarea,
        error ? styles.formInputError : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-invalid={error ? true : undefined}
      {...props}
    />
  );

  if (!label) return textarea;

  return (
    <div className={styles.formField}>
      <FormLabel htmlFor={textareaId}>{label as ReactNode}</FormLabel>
      {textarea}
      {error && <span className={styles.formError}>{error}</span>}
      {!error && hint && <span className={styles.formHint}>{hint}</span>}
    </div>
  );
}
