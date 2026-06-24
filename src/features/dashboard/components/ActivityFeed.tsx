import { useMemo } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectInboxItems } from '@/features/notifications/notificationSlice';
import styles from '../dashboard.module.css';

export function ActivityFeed() {
  const inbox = useAppSelector(selectInboxItems);

  const activities = useMemo(() => {
    if (inbox.length === 0) {
      return [
        {
          icon: '📡',
          bg: '#eaf3fb',
          title: 'Waiting for live updates',
          sub: 'Notifications will appear here from API',
          time: '—',
          dot: '#2E75B6',
        },
      ];
    }
    return inbox.slice(0, 5).map((item) => ({
      icon: item.icon,
      bg: item.iconBg,
      title: item.title,
      sub: item.body,
      time: item.time,
      dot: item.unread ? '#27AE60' : '#c8dbcf',
    }));
  }, [inbox]);

  return (
    <div className={styles.scheduleCard} id="activityCard" style={{ overflow: 'hidden' }}>
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleTitle}>Activity Feed</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Live updates</div>
      </div>
      {activities.map((a) => (
        <div key={a.title} className={styles.act2Item}>
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
