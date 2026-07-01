import styles from './ui.module.css';

export interface GuideCellProps {
  initials: string;
  name: string;
  sub?: string;
  favorite?: boolean;
  className?: string;
}

export function GuideCell({ initials, name, sub, favorite, className }: GuideCellProps) {
  return (
    <div className={[styles.guideCell, className].filter(Boolean).join(' ')}>
      <div className={styles.guideAvatar}>{initials}</div>
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
