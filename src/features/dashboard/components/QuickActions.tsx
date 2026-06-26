import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/constants/routes';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';
import styles from '../dashboard.module.css';

export function QuickActions() {
  const navigate = useNavigate();
  const dashboard = useAppSelector(selectDashboardData);
  const quick = dashboard?.quickActions;
  const payout = dashboard?.payout;

  const actions = useMemo(
    () => [
      {
        icon: '🗓️',
        bg: '#e0f5e9',
        label: 'Create Tour Slot',
        sub: 'Add new schedule',
        route: ROUTES.CREATE_TOUR,
      },
      {
        icon: '📋',
        bg: '#fef3c7',
        label: 'Review Applications',
        sub: `${quick?.pendingApplications ?? 0} awaiting`,
        route: ROUTES.APPLICATIONS,
      },
      {
        icon: '💸',
        bg: '#e0f5e9',
        label: 'Process Payouts',
        sub: `${quick?.pendingPayouts ?? 0} pending · €${(payout?.pendingAmount ?? 0).toLocaleString()}`,
        route: ROUTES.PAYOUTS,
      },
      {
        icon: '👤',
        bg: '#eaf3fb',
        label: 'Guide Approvals',
        sub: `${quick?.pendingGuideApprovals ?? 0} new registrations`,
        route: ROUTES.APPROVALS,
      },
    ],
    [quick, payout],
  );

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: 'var(--text-secondary)',
          marginBottom: 12,
        }}
      >
        Quick Actions
      </div>
      <div className={styles.quickActions} id="quickActions">
        {actions.map((a) => (
          <div
            key={a.label}
            className={styles.qaBtn}
            onClick={() => navigate(a.route)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(a.route)}
          >
            <div className={styles.qaIcon} style={{ background: a.bg }}>
              {a.icon}
            </div>
            <div>
              <div className={styles.qaLabel}>{a.label}</div>
              <div className={styles.qaSub}>{a.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
