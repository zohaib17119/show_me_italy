import { Tag } from 'antd';
import type { TourStatus } from '@/types';

const statusConfig: Record<
  TourStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  confirmed: {
    label: 'Confirmed',
    color: '#166534',
    bg: '#f0faf4',
    border: '#c1ebd3',
  },
  pending: {
    label: 'Pending',
    color: '#92400E',
    bg: '#fef3c7',
    border: '#f6d860',
  },
  unfilled: {
    label: 'Unfilled',
    color: '#E74C3C',
    bg: '#fdecea',
    border: '#f5c6c2',
  },
  denied: {
    label: 'Revision',
    color: '#E74C3C',
    bg: '#fdecea',
    border: '#f5c6c2',
  },
  completed: {
    label: 'Completed',
    color: '#166534',
    bg: '#f0faf4',
    border: '#c1ebd3',
  },
  approved: {
    label: 'Approved',
    color: '#1E8449',
    bg: '#f0faf4',
    border: '#c1ebd3',
  },
};

interface StatusBadgeProps {
  status: TourStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <Tag
      style={{
        color: cfg.color,
        background: cfg.bg,
        borderColor: cfg.border,
        fontWeight: 700,
        fontSize: 10,
        borderRadius: 999,
        margin: 0,
      }}
    >
      {cfg.label}
    </Tag>
  );
}
