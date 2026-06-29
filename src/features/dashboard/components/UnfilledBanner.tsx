import { useNavigate } from 'react-router-dom';
import { AppButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import styles from '../dashboard.module.css';

interface UnfilledBannerProps {
  count: number;
}

export function UnfilledBanner({ count }: UnfilledBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      className={styles.unfilledBanner}
      id="unfilledBanner"
      onClick={() => navigate(ROUTES.GUIDE_SLOTS)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.GUIDE_SLOTS)}
    >
      <div className={styles.unfilledIcon}>⚠️</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>
          {count} tour slot{count === 1 ? '' : 's'} still unfilled
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
          Assign guides before departure · Click to open Slot Assignment
        </div>
      </div>
      <AppButton variant="danger" size="sm" style={{ flexShrink: 0 }}>
        Assign Now →
      </AppButton>
    </div>
  );
}
