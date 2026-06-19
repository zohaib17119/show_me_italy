import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ROUTES } from '@/constants/routes';
import styles from '../dashboard.module.css';

export function UnfilledBanner() {
  const navigate = useNavigate();

  return (
    <div
      className={styles.unfilledBanner}
      id="unfilledBanner"
      onClick={() => navigate(ROUTES.ASSIGNMENT)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.ASSIGNMENT)}
    >
      <div className={styles.unfilledIcon}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#E74C3C' }}>
          5 tour slots still unfilled — including today at 14:30 (Spanish)
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
          Assign guides before departure · Click to open Slot Assignment
        </div>
      </div>
      <Button danger size="small" style={{ flexShrink: 0 }}>
        Assign Now →
      </Button>
    </div>
  );
}
