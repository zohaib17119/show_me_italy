import { useCallback, useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import { mapApplications } from '@/api/mappers/applicationMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { formatDisplayDate } from '@/api/utils/date';
import { ListErrorState, showToast } from '@/components/ui';
import { applicationsApi } from '@/features/applications/applicationsApi';
import type { Application } from '@/mocks/applications';
import { ApplicationsQueueTable } from './ApplicationsQueueTable';

interface ApplicationsQueueModalProps {
  open: boolean;
  dateKey: string | null;
  onClose: () => void;
  onQueueMutated?: () => void;
}

function formatModalTitle(dateKey: string): string {
  return `Pending Applications — ${formatDisplayDate(dateKey)}`;
}

export function ApplicationsQueueModal({
  open,
  dateKey,
  onClose,
  onQueueMutated,
}: ApplicationsQueueModalProps) {
  const [rows, setRows] = useState<Application[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [holdingId, setHoldingId] = useState<number | null>(null);
  const [mutationLoading, setMutationLoading] = useState(false);

  const loadApplications = useCallback(async () => {
    if (!dateKey) return;
    setStatus('loading');
    setError(null);
    try {
      const records = await applicationsApi.getAllAdminPending({ date: dateKey });
      setRows(mapApplications(records));
      setStatus('succeeded');
    } catch (err) {
      setStatus('failed');
      setError(getApiErrorMessage(err));
      setRows([]);
    }
  }, [dateKey]);

  const refreshAfterMutation = useCallback(async () => {
    await loadApplications();
    onQueueMutated?.();
  }, [loadApplications, onQueueMutated]);

  useEffect(() => {
    if (open && dateKey) {
      void loadApplications();
    } else if (!open) {
      setRows([]);
      setStatus('idle');
      setError(null);
      setApprovingId(null);
      setHoldingId(null);
      setMutationLoading(false);
    }
  }, [open, dateKey, loadApplications]);

  const handleApprove = useCallback(
    async (applicationId: number) => {
      setApprovingId(applicationId);
      setMutationLoading(true);
      try {
        await applicationsApi.approveGuideApplication({
          applicationId,
          status: 'Approved',
        });
        showToast('✓ Application approved');
        await refreshAfterMutation();
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to approve application');
      } finally {
        setApprovingId(null);
        setMutationLoading(false);
      }
    },
    [refreshAfterMutation],
  );

  const handleHold = useCallback(
    async (applicationId: number) => {
      setHoldingId(applicationId);
      setMutationLoading(true);
      try {
        await applicationsApi.approveGuideApplication({
          applicationId,
          status: 'Hold',
        });
        showToast('Application placed on hold');
        await refreshAfterMutation();
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to hold application');
      } finally {
        setHoldingId(null);
        setMutationLoading(false);
      }
    },
    [refreshAfterMutation],
  );

  return (
    <Modal
      open={open}
      title={dateKey ? formatModalTitle(dateKey) : 'Pending Applications'}
      onCancel={onClose}
      footer={null}
      width={960}
      destroyOnClose
    >
      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      )}

      {status === 'failed' && (
        <ListErrorState message={error} onRetry={() => void loadApplications()} />
      )}

      {status === 'succeeded' && rows.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 4px' }}>
          No pending applications for {dateKey ? formatDisplayDate(dateKey) : 'this date'}.
        </div>
      )}

      {status === 'succeeded' && rows.length > 0 && (
        <ApplicationsQueueTable
          key={dateKey ?? 'queue'}
          rows={rows}
          groupByTourSlot
          approvingId={approvingId}
          holdingId={holdingId}
          mutationLoading={mutationLoading}
          onApprove={handleApprove}
          onHold={handleHold}
        />
      )}
    </Modal>
  );
}
