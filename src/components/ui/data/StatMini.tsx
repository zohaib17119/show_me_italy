import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface StatMiniProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  className?: string;
  iconClassName?: string;
}

export function StatMini({ icon, value, label, className, iconClassName }: StatMiniProps) {
  return (
    <div className={[styles.statMini, className].filter(Boolean).join(' ')}>
      <div className={[styles.statMiniIcon, iconClassName].filter(Boolean).join(' ')}>
        {icon}
      </div>
      <div className={styles.statMiniBody}>
        <div className={styles.statMiniValue}>{value}</div>
        <div className={styles.statMiniLabel}>{label}</div>
      </div>
    </div>
  );
}
