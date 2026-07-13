import { Tooltip } from 'antd';
import { GuideAvatar } from './GuideAvatar';
import styles from './ui.module.css';

export interface GuideCellProps {
  initials: string;
  name: string;
  sub?: string;
  favorite?: boolean;
  profilePicture?: string | null;
  pendingCount?: number;
  className?: string;
}

export function GuideCell({
  initials,
  name,
  sub,
  favorite,
  profilePicture,
  pendingCount = 0,
  className,
}: GuideCellProps) {
  const showPendingBadge = pendingCount >= 1;

  return (
    <div className={[styles.guideCell, className].filter(Boolean).join(' ')}>
      <GuideAvatar initials={initials} profilePicture={profilePicture} size="sm" alt={name} />
      <div className={styles.guideBody}>
        <div className={styles.guideName}>
          <span className={styles.guideNameText}>
            {name}
            {favorite && (
              <span className={styles.guideFavoriteStar} aria-label="Favorite">
                ★
              </span>
            )}
          </span>
          {showPendingBadge && (
            <Tooltip title={`Pending applications: ${pendingCount}`}>
              <span className={styles.guidePendingBadge} aria-label={`${pendingCount} pending applications`}>
                {pendingCount}
              </span>
            </Tooltip>
          )}
        </div>
        {sub && <div className={styles.guideSub}>{sub}</div>}
      </div>
    </div>
  );
}
