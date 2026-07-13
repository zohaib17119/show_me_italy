import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { mapTourSlotToFormValues, mergeTourSlotForUpdate } from '@/api/mappers/tourMapper';
import type { TourSlot } from '@/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BreadcrumbNav,
  ListErrorState,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import {
  clearSelectedTour,
  fetchTourById,
  selectSelectedTour,
  selectTourDetailError,
  selectTourDetailStatus,
  selectTourMutationStatus,
  updateTourSlot,
} from '@/features/tour/tourSlice';
import { fetchTourTypes, selectActiveTourTypes } from '@/features/tourType/tourTypeSlice';
import type { LangCode } from '@/types';
import { TourSlotFormView } from './components/TourSlotFormView';
import {
  hasFieldErrors,
  validateSingleTourSlot,
  type TourSlotFieldErrors,
} from './utils/tourSlotValidation';

export function EditTourPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tour = useAppSelector(selectSelectedTour);
  const detailStatus = useAppSelector(selectTourDetailStatus);
  const detailError = useAppSelector(selectTourDetailError);
  const mutationStatus = useAppSelector(selectTourMutationStatus);
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const languages = useAppSelector(selectActiveLanguages);

  const tourSlotId = Number(id);

  const [originalTour, setOriginalTour] = useState<TourSlot | null>(null);
  const [tourTypeId, setTourTypeId] = useState(0);
  const [languageId, setLanguageId] = useState(0);
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [guidesNeeded, setGuidesNeeded] = useState(1);
  const [guestCount, setGuestCount] = useState(0);
  const [payRatePerHour, setPayRatePerHour] = useState(0);
  const [meetingPoint, setMeetingPoint] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('Open');
  const [tickets, setTickets] = useState<string | null>(null);
  const [openApplications, setOpenApplications] = useState(true);
  const [sendNotification, setSendNotification] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<TourSlotFieldErrors>({});
  const [formInitialized, setFormInitialized] = useState(false);

  const clearFieldError = (field: keyof TourSlotFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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

  useEffect(() => {
    if (!tour || formInitialized) return;
    const values = mapTourSlotToFormValues(tour);
    setOriginalTour(tour);
    setTourTypeId(values.tourTypeId);
    setLanguageId(values.languageId);
    setSlotDate(values.slotDate);
    setStartTime(values.startTime);
    setEndTime(values.endTime);
    setGuidesNeeded(values.guidesNeeded);
    setGuestCount(values.guestCount);
    setPayRatePerHour(values.payRatePerHour);
    setMeetingPoint(values.meetingPoint);
    setAdminNotes(values.adminNotes);
    setStatus(values.status);
    setTickets(values.tickets ?? null);
    setOpenApplications(values.openApplications);
    setSendNotification(values.sendNotification);
    setFormInitialized(true);
  }, [formInitialized, tour]);

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

  const selectedTourType = tourTypes.find((t) => t.tourTypeId === tourTypeId);
  const selectedLanguage = languages.find((l) => l.languageId === languageId);
  const langCode = (selectedLanguage?.code?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;

  const handleTourTypeChange = (nextTourTypeId: number) => {
    clearFieldError('tourTypeId');
    setTourTypeId(nextTourTypeId);
    const type = tourTypes.find((t) => t.tourTypeId === nextTourTypeId);
    setMeetingPoint(type?.meetingPointAddress?.trim() ?? '');
    setPayRatePerHour(type?.basePrice ?? 0);
    if (type?.meetingPointAddress?.trim()) {
      clearFieldError('meetingPoint');
    }
  };

  const handleSave = async () => {
    if (!originalTour) return;

    const errors = validateSingleTourSlot({
      tourTypeId,
      languageId,
      slotDate,
      startTime,
      endTime,
      meetingPoint,
      guestCount,
    });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    const formValues = {
      tourTypeId,
      languageId,
      slotDate,
      startTime,
      endTime,
      guidesNeeded,
      guestCount,
      payRatePerHour,
      meetingPoint,
      adminNotes,
      status,
      tickets,
      openApplications,
      sendNotification,
    };

    const payload = mergeTourSlotForUpdate(originalTour, formValues);

    try {
      await dispatch(updateTourSlot(payload)).unwrap();
      showToast('✓ Tour slot updated!');
      navigate(ROUTES.GUIDE_SLOTS);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update tour slot');
    }
  };

  const isSubmitting = mutationStatus === 'loading';
  const isLoading = detailStatus === 'loading' && !tour;

  if (!Number.isFinite(tourSlotId) || tourSlotId <= 0) {
    return (
      <div>
        <PageHeader title="Invalid Tour Slot" />
        <AppButton variant="secondary" onClick={() => navigate(ROUTES.GUIDE_SLOTS)}>
          Back to Guide Slots
        </AppButton>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (detailStatus === 'failed' || !tour || !originalTour) {
    return (
      <div>
        <BreadcrumbNav
          items={[
            { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
            { label: 'Guide Slots', onClick: () => navigate(ROUTES.GUIDE_SLOTS) },
            { label: 'Edit Tour Slot' },
          ]}
        />
        <PageHeader
          title="Tour Not Found"
          extra={
            <AppButton variant="secondary" onClick={() => navigate(ROUTES.GUIDE_SLOTS)}>
              Back to Guide Slots
            </AppButton>
          }
        />
        <ListErrorState message={detailError} onRetry={loadTour} />
      </div>
    );
  }

  const formValues = {
    tourTypeId,
    languageId,
    slotDate,
    startTime,
    endTime,
    guidesNeeded,
    guestCount,
    payRatePerHour,
    meetingPoint,
    adminNotes,
    status,
    tickets,
    openApplications,
    sendNotification,
  };

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Guide Slots', onClick: () => navigate(ROUTES.GUIDE_SLOTS) },
          { label: 'Edit Tour Slot' },
        ]}
      />

      <PageHeader
        title="Edit Tour Slot"
        subtitle={`Tour slot #${tourSlotId}`}
        extra={
          <>
            <AppButton variant="secondary" onClick={() => navigate(ROUTES.GUIDE_SLOTS)}>
              Cancel
            </AppButton>
            <AppButton onClick={() => void handleSave()} disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Edit Slot/Tour'}
            </AppButton>
          </>
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
          selectedTourTypeName={selectedTourType?.name ?? 'Tour'}
          langCode={langCode}
          showGuidesNeeded={false}
          meetingPointReadOnly
          errors={fieldErrors}
          onTourTypeIdChange={handleTourTypeChange}
          onLanguageIdChange={(value) => {
            clearFieldError('languageId');
            setLanguageId(value);
          }}
          onSlotDateChange={(value) => {
            clearFieldError('slotDate');
            setSlotDate(value);
          }}
          onStartTimeChange={(value) => {
            clearFieldError('startTime');
            setStartTime(value);
          }}
          onEndTimeChange={(value) => {
            clearFieldError('endTime');
            setEndTime(value);
          }}
          onGuestCountChange={(value) => {
            clearFieldError('guestCount');
            setGuestCount(value);
          }}
          onPayRatePerHourChange={setPayRatePerHour}
          onMeetingPointChange={(value) => {
            clearFieldError('meetingPoint');
            setMeetingPoint(value);
          }}
          onAdminNotesChange={setAdminNotes}
          onStatusChange={setStatus}
          onTicketsChange={setTickets}
          onOpenApplicationsChange={setOpenApplications}
          onSendNotificationChange={setSendNotification}
        />
      )}
    </div>
  );
}
