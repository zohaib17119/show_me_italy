import { Tag } from 'antd';
import type { TourStatus } from '@/types';
import styles from './StatusBadge.module.css';

const statusConfig: Record<TourStatus, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: styles.success },
  active: { label: 'Active', className: styles.success },
  pending: { label: 'Pending', className: styles.pending },
  inactive: { label: 'Inactive', className: styles.pending },
  unfilled: { label: 'Unfilled', className: styles.danger },
  rejected: { label: 'Rejected', className: styles.danger },
  completed: { label: 'Completed', className: styles.success },
  approved: { label: 'Approved', className: styles.approved },
  denied: { label: 'Revision', className: styles.danger },
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
