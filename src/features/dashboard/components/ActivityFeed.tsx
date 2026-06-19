import styles from '../dashboard.module.css';

const activities = [
  {
    icon: '✅',
    bg: '#e0f5e9',
    title: 'Marco Rossi applied — Fri 17 Apr EN',
    sub: 'Colosseum Arena · 10:00–12:30',
    time: '2m',
    dot: '#27AE60',
  },
  {
    icon: '👤',
    bg: '#eaf3fb',
    title: 'New guide: Yuki Tanaka registered',
    sub: 'JA · EN · Pending approval',
    time: '18m',
    dot: '#2E75B6',
  },
  {
    icon: '💰',
    bg: '#fef3c7',
    title: 'Sofia Conti submitted March payout',
    sub: '€640.00 · Pending review',
    time: '1h',
    dot: '#F59E0B',
  },
  {
    icon: '📅',
    bg: '#e0f5e9',
    title: '4 tour slots created via Bulk',
    sub: 'Week of Apr 21 · EN IT FR DE',
    time: '3h',
    dot: '#c8dbcf',
  },
  {
    icon: '⚠️',
    bg: '#fdecea',
    title: '24h Warning: ES slot unfilled',
    sub: 'Tomorrow 14:30 · No guide assigned',
    time: '4h',
    dot: '#E74C3C',
  },
];

export function ActivityFeed() {
  return (
    <div
      className={styles.scheduleCard}
      id="activityCard"
      style={{ overflow: 'hidden' }}
    >
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
