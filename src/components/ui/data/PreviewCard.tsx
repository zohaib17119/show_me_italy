import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface PreviewCardProps {
  label?: string;
  title: string;
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PreviewCard({ label, title, meta, children, className }: PreviewCardProps) {
  return (
    <div className={[styles.previewCard, className].filter(Boolean).join(' ')}>
      {label && <div className={styles.previewCardLabel}>{label}</div>}
      <div className={styles.previewCardTitle}>{title}</div>
      {meta && <div className={styles.previewCardMeta}>{meta}</div>}
      {children}
    </div>
  );
}
