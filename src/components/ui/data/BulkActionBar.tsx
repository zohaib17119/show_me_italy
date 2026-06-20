import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface BulkActionBarProps {
  selectedCount: number;
  children: ReactNode;
  className?: string;
}

export function BulkActionBar({ selectedCount, children, className }: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <div className={[styles.bulkBar, className].filter(Boolean).join(' ')}>
      <span className={styles.bulkBarCount}>
        {selectedCount} selected
      </span>
      <div className={styles.bulkBarActions}>{children}</div>
    </div>
  );
}
