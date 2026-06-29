import { Spin } from 'antd';
import styles from './LoadingOverlay.module.css';

export interface LoadingOverlayProps {
  visible: boolean;
  label?: string;
}

export function LoadingOverlay({ visible, label }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.content}>
        <Spin size="large" />
        {label && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  );
}
