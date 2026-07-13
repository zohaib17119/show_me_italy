import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/constants/routes';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';
import styles from '../dashboard.module.css';

export function QuickActions() {
  const navigate = useNavigate();
  const dashboard = useAppSelector(selectDashboardData);
  const stats = dashboard?.stats;
  const header = dashboard?.header;
  const quick = dashboard?.quickActions;
  // Hidden until payouts work resumes:
  // const payout = dashboard?.payout;

  const pendingApplications =
    stats?.pendingApplications ??
    quick?.pendingApplications ??
    header?.pendingApplications ??
    0;

  // Hidden until payouts work resumes:
  // const pendingPayouts =
  //   stats?.pendingPayouts ??
  //   quick?.pendingPayouts ??
  //   payout?.pendingCount ??
  //   header?.pendingPayoutRequests ??
  //   0;

  const pendingGuideApprovals = quick?.pendingGuideApprovals ?? 0;

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
        sub: `${pendingApplications} awaiting`,
        route: ROUTES.APPLICATIONS,
      },
      // Hidden until payouts work resumes:
      // {
      //   icon: '💸',
      //   bg: '#e0f5e9',
      //   label: 'Process Payouts',
      //   sub: `${pendingPayouts} pending · €${(payout?.pendingAmount ?? 0).toLocaleString()}`,
      //   route: ROUTES.PAYOUTS,
      // },
      {
        icon: '👤',
        bg: '#eaf3fb',
        label: 'Guide Approvals',
        sub: `${pendingGuideApprovals} new registrations`,
        route: ROUTES.APPROVALS,
      },
    ],
    [pendingApplications, pendingGuideApprovals],
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
