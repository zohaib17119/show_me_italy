import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface AppCardProps {
  children: ReactNode;
  title?: string;
  extra?: ReactNode;
  padding?: 'default' | 'sm';
  className?: string;
}

export function AppCard({
  children,
  title,
  extra,
  padding = 'default',
  className,
}: AppCardProps) {
  const paddingClass = padding === 'sm' ? styles.cardPaddingSm : styles.cardPadding;

  return (
    <div className={[styles.card, paddingClass, className].filter(Boolean).join(' ')}>
      {(title || extra) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {extra}
        </div>
      )}
      {children}
    </div>
  );
}
