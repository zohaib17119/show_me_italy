import type { ReactNode } from 'react';
import styles from './ui.module.css';

export interface NotificationItemProps {
  icon: ReactNode;
  title: string;
  sub?: string;
  meta?: string;
  time?: string;
  unread?: boolean;
  titleAction?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function NotificationItem({
  icon,
  title,
  sub,
  meta,
  time,
  unread = false,
  titleAction,
  onClick,
  className,
}: NotificationItemProps) {
  const showFooter = Boolean(titleAction || time || unread);

  return (
    <div
      className={[
        styles.notificationItem,
        unread ? styles.notificationUnread : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className={styles.notificationIcon}>{icon}</div>
      <div className={styles.notificationBody}>
        <div className={styles.notificationTitle}>{title}</div>
        {sub && <div className={styles.notificationSub}>{sub}</div>}
        {meta && <div className={styles.notificationMeta}>{meta}</div>}
        {showFooter && (
          <div className={styles.notificationFooter}>
            <div className={styles.notificationFooterAction}>{titleAction}</div>
            <div className={styles.notificationFooterMeta}>
              {time && <span className={styles.notificationTime}>{time}</span>}
              {unread && <span className={styles.notificationDot} aria-hidden />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
