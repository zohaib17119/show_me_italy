import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import styles from '../dashboard.module.css';

const actions = [
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
    sub: '12 awaiting',
    route: ROUTES.APPLICATIONS,
  },
  {
    icon: '💸',
    bg: '#e0f5e9',
    label: 'Process Payouts',
    sub: '7 pending · €4,230',
    route: ROUTES.PAYOUTS,
  },
  {
    icon: '👤',
    bg: '#eaf3fb',
    label: 'Guide Approvals',
    sub: '3 new registrations',
    route: ROUTES.APPROVALS,
  },
];

export function QuickActions() {
  const navigate = useNavigate();

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
