import { GuideAvatar } from './GuideAvatar';
import styles from './ui.module.css';

export interface GuideCellProps {
  initials: string;
  name: string;
  sub?: string;
  favorite?: boolean;
  profilePicture?: string | null;
  className?: string;
}

export function GuideCell({
  initials,
  name,
  sub,
  favorite,
  profilePicture,
  className,
}: GuideCellProps) {
  return (
    <div className={[styles.guideCell, className].filter(Boolean).join(' ')}>
      <GuideAvatar initials={initials} profilePicture={profilePicture} size="sm" alt={name} />
      <div className={styles.guideBody}>
        <div className={styles.guideName}>
          {name}
          {favorite && (
            <span className={styles.guideFavoriteStar} aria-label="Favorite">
              ★
            </span>
          )}
        </div>
        {sub && <div className={styles.guideSub}>{sub}</div>}
      </div>
    </div>
  );
}
