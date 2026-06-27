import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { mapTourSlotToFormValues } from '@/api/mappers/tourMapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BreadcrumbNav,
  ListErrorState,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { ROUTES } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import {
  clearSelectedTour,
  fetchTourById,
  selectSelectedTour,
  selectTourDetailError,
  selectTourDetailStatus,
} from '@/features/tour/tourSlice';
import { fetchTourTypes, selectActiveTourTypes } from '@/features/tourType/tourTypeSlice';
import type { LangCode } from '@/types';
import { TourSlotFormView } from './components/TourSlotFormView';

export function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tour = useAppSelector(selectSelectedTour);
  const detailStatus = useAppSelector(selectTourDetailStatus);
  const detailError = useAppSelector(selectTourDetailError);
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const languages = useAppSelector(selectActiveLanguages);

  const tourSlotId = Number(id);

  useFetchErrorToast(detailStatus, detailError);

  const loadTour = useCallback(() => {
    if (!Number.isFinite(tourSlotId) || tourSlotId <= 0) return;
    void dispatch(fetchTourById(tourSlotId));
  }, [dispatch, tourSlotId]);

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
  }, [dispatch]);

  useEffect(() => {
    loadTour();
    return () => {
      dispatch(clearSelectedTour());
    };
  }, [dispatch, loadTour]);

  const tourTypeOptions = useMemo(
    () =>
      tourTypes.map((t) => ({
        value: String(t.tourTypeId),
        label: t.name ?? `Tour #${t.tourTypeId}`,
      })),
    [tourTypes],
  );

  const languageOptions = useMemo(
    () =>
      languages.map((l) => ({
        value: String(l.languageId),
        label: `${l.name ?? l.code}`,
      })),
    [languages],
  );

  const selectedTourType = tourTypes.find((t) => t.tourTypeId === tour?.tourTypeId);
  const selectedLanguage = languages.find((l) => l.languageId === tour?.languageId);
  const langCode = (selectedLanguage?.code?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;

  if (!Number.isFinite(tourSlotId) || tourSlotId <= 0) {
    return (
      <div>
        <PageHeader title="Invalid Tour" />
        <AppButton variant="secondary" onClick={() => navigate(ROUTES.CALENDAR)}>
          Back to Calendar
        </AppButton>
      </div>
    );
  }

  if (detailStatus === 'loading' && !tour) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (detailStatus === 'failed' || !tour) {
    return (
      <div>
        <BreadcrumbNav
          items={[
            { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
            { label: 'Schedule', onClick: () => navigate(ROUTES.CALENDAR) },
            { label: 'Tour Detail' },
          ]}
        />
        <PageHeader
          title="Tour Not Found"
          extra={
            <AppButton variant="secondary" onClick={() => navigate(ROUTES.CALENDAR)}>
              Back to Calendar
            </AppButton>
          }
        />
        <ListErrorState message={detailError} onRetry={loadTour} />
      </div>
    );
  }

  const formValues = mapTourSlotToFormValues(tour);
  const pageTitle = selectedTourType?.name ?? `Tour #${tour.tourSlotId ?? tourSlotId}`;

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Schedule', onClick: () => navigate(ROUTES.CALENDAR) },
          { label: pageTitle },
        ]}
      />

      <PageHeader
        title={pageTitle}
        subtitle={`Tour slot #${tour.tourSlotId ?? tourSlotId}`}
        extra={
          <AppButton variant="secondary" onClick={() => navigate(ROUTES.CALENDAR)}>
            Back to Calendar
          </AppButton>
        }
      />

      {tourTypeOptions.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <TourSlotFormView
          values={formValues}
          tourTypeOptions={tourTypeOptions}
          languageOptions={languageOptions}
          selectedTourTypeName={selectedTourType?.name ?? pageTitle}
          langCode={langCode}
          readOnly
          showExtraFields
        />
      )}
    </div>
  );
}
