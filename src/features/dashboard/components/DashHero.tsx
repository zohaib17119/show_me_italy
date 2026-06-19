import { useNavigate } from 'react-router-dom';
import { PlusOutlined, UnorderedListOutlined, WalletOutlined } from '@ant-design/icons';
import { ROUTES } from '@/constants/routes';
import styles from '../dashboard.module.css';

export function DashHero() {
  const navigate = useNavigate();

  return (
    <div className={styles.dashHero} id="dashHero">
      <div className={styles.dashHeroContent}>
        <div className={styles.dashHeroTop}>
          <div>
            <div className={styles.dashHeroGreeting}>Wednesday, 14 April 2026</div>
            <h2 className={styles.dashHeroTitle}>Good morning, Super Admin 👋</h2>
            <div className={styles.dashHeroDate}>
              You have <strong style={{ color: '#4ADE80' }}>8 tours</strong> scheduled today ·{' '}
              <strong style={{ color: '#FCD34D' }}>5 unfilled slots</strong> need attention
            </div>
          </div>
          <div className={styles.dashHeroStatus}>
            <div className="pulse-dot" />
            <span className={styles.dashHeroStatusText}>Live · Last synced 2 min ago</span>
          </div>
        </div>
        <div className={styles.dashHeroActions}>
          <button
            type="button"
            className={styles.dashHeroBtnPrimary}
            onClick={() => navigate(ROUTES.CREATE_TOUR)}
          >
            <PlusOutlined /> New Tour Slot
          </button>
          <button
            type="button"
            className={styles.dashHeroBtnOutline}
            onClick={() => navigate(ROUTES.APPLICATIONS)}
          >
            <UnorderedListOutlined style={{ color: 'white' }} /> 12 Pending Apps
          </button>
          <button
            type="button"
            className={styles.dashHeroBtnOutline}
            onClick={() => navigate(ROUTES.PAYOUTS)}
          >
            <WalletOutlined style={{ color: 'white' }} /> 7 Payout Requests
          </button>
        </div>
      </div>
    </div>
  );
}
