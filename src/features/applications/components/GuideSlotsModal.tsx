import { useCallback, useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import { mapGuideSlots } from '@/api/mappers/guideSlotMapper';
import type { GuideSlotRow } from '@/api/mappers/guideSlotMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { ListErrorState } from '@/components/ui';
import { formatDisplayDate } from '@/api/utils/date';
import { applicationsApi } from '@/features/applications/applicationsApi';
import { GuideSlotsTable } from './GuideSlotsTable';

interface GuideSlotsModalProps {
  open: boolean;
  dateKey: string | null;
  onClose: () => void;
}

function formatModalTitle(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Guide Slots — ${label}`;
}

export function GuideSlotsModal({ open, dateKey, onClose }: GuideSlotsModalProps) {
  const [rows, setRows] = useState<GuideSlotRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    if (!dateKey) return;
    setStatus('loading');
    setError(null);
    try {
      const records = await applicationsApi.getGuideSlots(dateKey);
      setRows(mapGuideSlots(records));
      setStatus('succeeded');
    } catch (err) {
      setStatus('failed');
      setError(getApiErrorMessage(err));
      setRows([]);
    }
  }, [dateKey]);

  useEffect(() => {
    if (open && dateKey) {
      void loadSlots();
    } else if (!open) {
      setRows([]);
      setStatus('idle');
      setError(null);
    }
  }, [open, dateKey, loadSlots]);

  return (
    <Modal
      open={open}
      title={dateKey ? formatModalTitle(dateKey) : 'Guide Slots'}
      onCancel={onClose}
      footer={null}
      width={920}
      destroyOnClose
    >
      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      )}

      {status === 'failed' && (
        <ListErrorState message={error} onRetry={() => void loadSlots()} />
      )}

      {status === 'succeeded' && rows.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 4px' }}>
          No guide slots for {dateKey ? formatDisplayDate(dateKey) : 'this date'}.
        </div>
      )}

      {status === 'succeeded' && rows.length > 0 && (
        <GuideSlotsTable key={dateKey ?? 'slots'} rows={rows} showSearch={false} />
      )}
    </Modal>
  );
}
