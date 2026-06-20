import { Tag } from 'antd';
import type { TourStatus } from '@/types';
import styles from './StatusBadge.module.css';

const statusConfig: Record<TourStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: styles.success },
  pending: { label: 'Pending', className: styles.pending },
  unfilled: { label: 'Unfilled', className: styles.danger },
  denied: { label: 'Revision', className: styles.danger },
  completed: { label: 'Completed', className: styles.success },
  approved: { label: 'Approved', className: styles.approved },
};

interface StatusBadgeProps {
  status: TourStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <Tag className={[styles.badge, cfg.className].join(' ')}>
      {cfg.label}
    </Tag>
  );
}
