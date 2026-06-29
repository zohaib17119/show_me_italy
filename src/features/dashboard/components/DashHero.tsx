import { useNavigate } from 'react-router-dom';
import { PlusOutlined, UnorderedListOutlined, WalletOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/constants/routes';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';
import styles from '../dashboard.module.css';

function formatHeaderDate(value?: string): string {
  if (!value) {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DashHero() {
  const navigate = useNavigate();
  const dashboard = useAppSelector(selectDashboardData);
  const header = dashboard?.header;

  return (
    <div className={styles.dashHero} id="dashHero">
      <div className={styles.dashHeroContent}>
        <div className={styles.dashHeroTop}>
          <div>
            <div className={styles.dashHeroGreeting}>{formatHeaderDate(header?.currentDate)}</div>
            <h2 className={styles.dashHeroTitle}>
              {header?.greeting ?? 'Good morning'}, {header?.userName ?? 'Admin'} 👋
            </h2>
            <div className={styles.dashHeroDate}>
              You have{' '}
              <strong style={{ color: '#4ADE80' }}>{header?.toursToday ?? 0} tours</strong>{' '}
              scheduled today ·{' '}
              <strong style={{ color: '#FCD34D' }}>{header?.unfilledSlots ?? 0} unfilled slots</strong>{' '}
              need attention
            </div>
          </div>
          <div className={styles.dashHeroStatus}>
            <div className="pulse-dot" />
            <span className={styles.dashHeroStatusText}>Live · Dashboard API</span>
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
            <UnorderedListOutlined style={{ color: 'white' }} />{' '}
            {header?.pendingApplications ?? 0} Pending Applications
          </button>
          <button
            type="button"
            className={styles.dashHeroBtnOutline}
            onClick={() => navigate(ROUTES.PAYOUTS)}
          >
            <WalletOutlined style={{ color: 'white' }} />{' '}
            {header?.pendingPayoutRequests ?? 0} Payout Requests
          </button>
        </div>
      </div>
    </div>
  );
}
