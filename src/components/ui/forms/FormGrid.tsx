import type { ReactNode } from 'react';
import styles from './forms.module.css';

export interface FormGridProps {
  children: ReactNode;
  className?: string;
}

/** Apply to child elements to span both columns */
export const formGridSpanFull = styles.spanFull;

export function FormGrid({ children, className }: FormGridProps) {
  return (
    <div className={[styles.formGrid, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
