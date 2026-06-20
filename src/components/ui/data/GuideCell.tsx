import styles from './ui.module.css';

export interface GuideCellProps {
  initials: string;
  name: string;
  sub?: string;
  className?: string;
}

export function GuideCell({ initials, name, sub, className }: GuideCellProps) {
  return (
    <div className={[styles.guideCell, className].filter(Boolean).join(' ')}>
      <div className={styles.guideAvatar}>{initials}</div>
      <div className={styles.guideBody}>
        <div className={styles.guideName}>{name}</div>
        {sub && <div className={styles.guideSub}>{sub}</div>}
      </div>
    </div>
  );
}
