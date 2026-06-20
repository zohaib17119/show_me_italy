import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div className={[styles.filterBar, className].filter(Boolean).join(' ')}>{children}</div>
  );
}
