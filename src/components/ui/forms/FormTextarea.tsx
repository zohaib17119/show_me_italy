import type { ReactNode, TextareaHTMLAttributes } from 'react';
import styles from './forms.module.css';
import { FormLabel } from './FormLabel';

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function FormTextarea({
  label,
  hint,
  id,
  className,
  ...props
}: FormTextareaProps) {
  const textareaId =
    id ?? (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const textarea = (
    <textarea
      id={textareaId}
      className={[styles.formTextarea, className].filter(Boolean).join(' ')}
      {...props}
    />
  );

  if (!label) return textarea;

  return (
    <div className={styles.formField}>
      <FormLabel htmlFor={textareaId}>{label as ReactNode}</FormLabel>
      {textarea}
      {hint && <span className={styles.formHint}>{hint}</span>}
    </div>
  );
}
