import styles from '../dashboard.module.css';

const avatars = [
  { initials: 'MR', bg: '#1E8449' },
  { initials: 'SC', bg: '#1a6b8a' },
  { initials: 'HM', bg: '#6a3a9a' },
  { initials: 'AD', bg: '#8a3a2a' },
  { initials: 'YT', bg: '#2a5a7a' },
];

export function GuidesOnline() {
  return (
    <div className={styles.guidesOnline} id="guidesOnline">
      <div className={styles.goTitle}>Guides Online Now</div>
      <div className={styles.goCount}>12</div>
      <div className={styles.goSub}>of 48 active guides · 5 on tour today</div>
      <div className={styles.goAvatars}>
        {avatars.map((a) => (
          <div key={a.initials} className={styles.goAv} style={{ background: a.bg }}>
            {a.initials}
          </div>
        ))}
        <div
          className={styles.goAv}
          style={{
            background: 'rgba(255,255,255,0.2)',
            fontSize: 8,
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          +7
        </div>
      </div>
    </div>
  );
}
