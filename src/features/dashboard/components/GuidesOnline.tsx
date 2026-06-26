import { useAppSelector } from '@/app/hooks';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';
import styles from '../dashboard.module.css';

export function GuidesOnline() {
  const dashboard = useAppSelector(selectDashboardData);
  const guideStatus = dashboard?.guideStatus;
  const online = guideStatus?.onlineGuides ?? 0;
  const total = guideStatus?.totalActiveGuides ?? 0;

  return (
    <div className={styles.guidesOnline} id="guidesOnline">
      <div className={styles.goTitle}>Guides Online Now</div>
      <div className={styles.goCount}>{online}</div>
      <div className={styles.goSub}>of {total} active guides</div>
      <div className={styles.goAvatars}>
        {Array.from({ length: Math.min(online, 5) }, (_, i) => (
          <div
            key={i}
            className={styles.goAv}
            style={{ background: ['#1E8449', '#1a6b8a', '#6a3a9a', '#8a3a2a', '#2a5a7a'][i] }}
          >
            G{i + 1}
          </div>
        ))}
        {online > 5 && (
          <div
            className={styles.goAv}
            style={{
              background: 'rgba(255,255,255,0.2)',
              fontSize: 8,
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            +{online - 5}
          </div>
        )}
      </div>
    </div>
  );
}
