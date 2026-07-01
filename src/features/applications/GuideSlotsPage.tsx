import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  ListErrorState,
  LoadingOverlay,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  fetchGuideSlots,
  selectGuideSlots,
  selectGuideSlotsError,
  selectGuideSlotsStatus,
} from '@/features/applications/applicationsSlice';
import { GuideSlotsTable } from '@/features/applications/components/GuideSlotsTable';

export function GuideSlotsPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.GUIDE_SLOTS);
  const guideSlots = useAppSelector(selectGuideSlots);
  const status = useAppSelector(selectGuideSlotsStatus);
  const error = useAppSelector(selectGuideSlotsError);

  const loadGuideSlots = useCallback(() => {
    void dispatch(fetchGuideSlots());
  }, [dispatch]);

  useFetchErrorToast(status, error);

  useEffect(() => {
    loadGuideSlots();
  }, [loadGuideSlots]);

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={status === 'loading' && guideSlots.length === 0} />

      <PageHeader
        title={meta.title}
        subtitle={`${guideSlots.length} slot${guideSlots.length === 1 ? '' : 's'} with applications`}
      />

      {status === 'failed' && (
        <ListErrorState message={error} onRetry={loadGuideSlots} />
      )}

      {status !== 'failed' && (
        <GuideSlotsTable
          rows={guideSlots}
          loading={status === 'loading' && guideSlots.length === 0}
        />
      )}
    </div>
  );
}
