import { useCallback, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  ListErrorState,
  showToast,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  approveApplication,
  fetchApplications,
  selectApplications,
  selectApplicationsError,
  selectApplicationsMutationStatus,
  selectApplicationsStatus,
} from '@/features/applications/applicationsSlice';
import { ApplicationsQueueTable } from './components/ApplicationsQueueTable';

export function ApplicationsPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.APPLICATIONS);
  const applications = useAppSelector(selectApplications);
  const status = useAppSelector(selectApplicationsStatus);
  const error = useAppSelector(selectApplicationsError);
  const mutationStatus = useAppSelector(selectApplicationsMutationStatus);

  const [approvingId, setApprovingId] = useState<number | null>(null);

  const loadApplications = useCallback(() => {
    void dispatch(fetchApplications());
  }, [dispatch]);

  useFetchErrorToast(status, error);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleApprove = useCallback(
    async (applicationId: number) => {
      setApprovingId(applicationId);
      try {
        await dispatch(approveApplication(applicationId)).unwrap();
        showToast('✓ Application approved');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to approve application');
      } finally {
        setApprovingId(null);
      }
    },
    [dispatch],
  );

  return (
    <div>
      <PageHeader
        title={meta.title}
        subtitle={`${applications.length} pending · nearest first`}
        extra={
          <AppButton variant="secondary" onClick={() => showToast('Export started')}>
            Export CSV
          </AppButton>
        }
      />

      {status === 'loading' && applications.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      {status === 'failed' && (
        <ListErrorState message={error} onRetry={loadApplications} />
      )}

      {status !== 'failed' && (
        <ApplicationsQueueTable
          rows={applications}
          loading={status === 'loading'}
          showSearch
          showPayRate
          approvingId={approvingId}
          mutationLoading={mutationStatus === 'loading'}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}
