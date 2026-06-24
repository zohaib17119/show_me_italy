import { useAppSelector } from '@/app/hooks';
import { selectVerifiedGuides } from '@/features/agent/agentSlice';
import styles from '../dashboard.module.css';

export function GuidesOnline() {
  const verified = useAppSelector(selectVerifiedGuides);
  const avatars = verified.slice(0, 5);

  return (
    <div className={styles.guidesOnline} id="guidesOnline">
      <div className={styles.goTitle}>Guides Online Now</div>
      <div className={styles.goCount}>{Math.min(verified.length, 12)}</div>
      <div className={styles.goSub}>
        of {verified.length} active guides · from API
      </div>
      <div className={styles.goAvatars}>
        {avatars.map((g, i) => (
          <div
            key={g.id}
            className={styles.goAv}
            style={{ background: ['#1E8449', '#1a6b8a', '#6a3a9a', '#8a3a2a', '#2a5a7a'][i] }}
          >
            {g.initials}
          </div>
        ))}
        {verified.length > 5 && (
          <div
            className={styles.goAv}
            style={{
              background: 'rgba(255,255,255,0.2)',
              fontSize: 8,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            +{verified.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
