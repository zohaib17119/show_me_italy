import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';

export interface SectionLabelProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function SectionLabel({ children, className, ...props }: SectionLabelProps) {
  return (
    <p className={[styles.secLabel, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </p>
  );
}
