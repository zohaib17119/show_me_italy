import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface ImportPreviewRowProps {
  title: string;
  sub?: string;
  tag?: ReactNode;
  conflict?: boolean;
  className?: string;
}

export function ImportPreviewRow({
  title,
  sub,
  tag,
  conflict = false,
  className,
}: ImportPreviewRowProps) {
  return (
    <div
      className={[
        styles.importPreviewRow,
        conflict ? styles.importPreviewRowConflict : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.importPreviewStatus} aria-hidden />
      <div className={styles.importPreviewBody}>
        <div className={styles.importPreviewTitle}>{title}</div>
        {sub && <div className={styles.importPreviewSub}>{sub}</div>}
      </div>
      {tag && <span className={styles.importPreviewTag}>{tag}</span>}
    </div>
  );
}
