import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface StatMiniRowProps {
  children: ReactNode;
  className?: string;
}

export function StatMiniRow({ children, className }: StatMiniRowProps) {
  return (
    <div className={[styles.statMiniRow, className].filter(Boolean).join(' ')}>{children}</div>
  );
}
