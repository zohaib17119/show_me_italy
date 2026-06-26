import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';
import styles from '../dashboard.module.css';

function formatActivityTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function ActivityFeed() {
  const dashboard = useAppSelector(selectDashboardData);
  const items = dashboard?.activity?.activities ?? [];

  const activities = useMemo(() => {
    if (items.length === 0) {
      return [
        {
          icon: '📡',
          bg: '#eaf3fb',
          title: 'No recent activity',
          sub: 'Updates will appear here from the dashboard API',
          time: '—',
          dot: '#c8dbcf',
        },
      ];
    }
    return items.slice(0, 5).map((item) => ({
      icon: '📌',
      bg: '#eaf3fb',
      title: item.title ?? 'Activity',
      sub: item.description ?? '',
      time: formatActivityTime(item.createdOn),
      dot: '#27AE60',
    }));
  }, [items]);

  return (
    <div className={styles.scheduleCard} id="activityCard" style={{ overflow: 'hidden' }}>
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleTitle}>Activity Feed</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Live updates</div>
      </div>
      {activities.map((a) => (
        <div key={`${a.title}-${a.time}`} className={styles.act2Item}>
          <div className={styles.act2Icon} style={{ background: a.bg }}>
            {a.icon}
          </div>
          <div className={styles.act2Body}>
            <div className={styles.act2Title}>{a.title}</div>
            <div className={styles.act2Sub}>{a.sub}</div>
          </div>
          <div className={styles.act2Time}>{a.time}</div>
          <div className={styles.act2Indicator} style={{ background: a.dot }} />
        </div>
      ))}
    </div>
  );
}
