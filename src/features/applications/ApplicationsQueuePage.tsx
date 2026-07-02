import { useCallback, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { mapApplications } from '@/api/mappers/applicationMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { formatDisplayDate } from '@/api/utils/date';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  ListErrorState,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { applicationsApi } from '@/features/applications/applicationsApi';
import type { Application } from '@/mocks/applications';
import { ApplicationsQueueTable } from './components/ApplicationsQueueTable';

export function ApplicationsQueuePage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Application[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [holdingId, setHoldingId] = useState<number | null>(null);
  const [mutationLoading, setMutationLoading] = useState(false);

  const loadApplications = useCallback(async () => {
    if (!date) return;
    setStatus('loading');
    setError(null);
    try {
      const records = await applicationsApi.getAllAdminPending({ date });
      setRows(mapApplications(records));
      setStatus('succeeded');
    } catch (err) {
      setStatus('failed');
      setError(getApiErrorMessage(err));
      setRows([]);
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      void loadApplications();
    }
  }, [date, loadApplications]);

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
        await loadApplications();
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to approve application');
      } finally {
        setApprovingId(null);
        setMutationLoading(false);
      }
    },
    [loadApplications],
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
        await loadApplications();
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to hold application');
      } finally {
        setHoldingId(null);
        setMutationLoading(false);
      }
    },
    [loadApplications],
  );

  const dateLabel = date ? formatDisplayDate(date) : '—';

  return (
    <div>
      <PageHeader
        title={`Pending Applications — ${dateLabel}`}
        subtitle={
          status === 'succeeded'
            ? `${rows.length} application${rows.length === 1 ? '' : 's'}`
            : 'Applications / Queue'
        }
        extra={
          <AppButton variant="secondary" onClick={() => navigate(ROUTES.APPLICATIONS)}>
            Back to Calendar
          </AppButton>
        }
      />

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
          No pending applications for {dateLabel}.
        </div>
      )}

      {status === 'succeeded' && rows.length > 0 && (
        <ApplicationsQueueTable
          key={date ?? 'queue'}
          rows={rows}
          groupByTourSlot
          showGuideNotes
          approvingId={approvingId}
          holdingId={holdingId}
          mutationLoading={mutationLoading}
          onApprove={handleApprove}
          onHold={handleHold}
        />
      )}
    </div>
  );
}
