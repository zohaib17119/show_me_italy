import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface SettingsRowProps {
  icon: ReactNode;
  title: string;
  sub?: string;
  action?: ReactNode;
  className?: string;
}

export function SettingsRow({ icon, title, sub, action, className }: SettingsRowProps) {
  return (
    <div className={[styles.settingsRow, className].filter(Boolean).join(' ')}>
      <div className={styles.settingsIcon}>{icon}</div>
      <div className={styles.settingsBody}>
        <div className={styles.settingsTitle}>{title}</div>
        {sub && <div className={styles.settingsSub}>{sub}</div>}
      </div>
      {action && <div className={styles.settingsAction}>{action}</div>}
    </div>
  );
}
