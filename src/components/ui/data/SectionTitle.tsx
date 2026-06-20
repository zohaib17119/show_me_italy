import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';

export interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function SectionTitle({ children, className, ...props }: SectionTitleProps) {
  return (
    <h2 className={[styles.secTitle, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </h2>
  );
}
