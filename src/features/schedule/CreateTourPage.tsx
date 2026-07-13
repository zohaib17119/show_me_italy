import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { buildTourSlotPayload } from '@/api/mappers/tourMapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BreadcrumbNav,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import {
  createTourSlot,
  selectTourMutationStatus,
} from '@/features/tour/tourSlice';
import { fetchTourTypes, selectActiveTourTypes } from '@/features/tourType/tourTypeSlice';
import type { LangCode } from '@/types';
import { TourSlotFormView } from './components/TourSlotFormView';
import {
  hasFieldErrors,
  validateSingleTourSlot,
  type TourSlotFieldErrors,
} from './utils/tourSlotValidation';

export function CreateTourPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const languages = useAppSelector(selectActiveLanguages);
  const mutationStatus = useAppSelector(selectTourMutationStatus);

  const [tourTypeId, setTourTypeId] = useState<number>(0);
  const [languageId, setLanguageId] = useState<number>(0);
  const [slotDate, setSlotDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [guestCount, setGuestCount] = useState(0);
  const [payRatePerHour, setPayRatePerHour] = useState(0);
  const [meetingPoint, setMeetingPoint] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('Open');
  const [tickets, setTickets] = useState<string | null>(null);
  const [openApplications, setOpenApplications] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<TourSlotFieldErrors>({});

  const clearFieldError = (field: keyof TourSlotFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
  }, [dispatch]);

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

  const handleTourTypeChange = (id: number) => {
    clearFieldError('tourTypeId');
    setTourTypeId(id);
    const type = tourTypes.find((t) => t.tourTypeId === id);
    setMeetingPoint(type?.meetingPointAddress?.trim() ?? '');
    setPayRatePerHour(type?.basePrice ?? 0);
    if (type?.meetingPointAddress?.trim()) {
      clearFieldError('meetingPoint');
    }
  };

  const handlePublish = async () => {
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

    const payload = buildTourSlotPayload({
      tourTypeId,
      slotDate,
      startTime,
      endTime,
      languageId,
      guidesNeeded: 1,
      guestCount,
      payRatePerHour,
      meetingPoint,
      adminNotes,
      status,
      tickets,
    });

    try {
      await dispatch(createTourSlot(payload)).unwrap();
      showToast('✓ Tour slot published!');
      navigate(ROUTES.CALENDAR);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create tour slot');
    }
  };

  const isSubmitting = mutationStatus === 'loading';

  const formValues = {
    tourTypeId,
    languageId,
    slotDate,
    startTime,
    endTime,
    guidesNeeded: 1,
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
          { label: 'Schedule', onClick: () => navigate(ROUTES.CALENDAR) },
          { label: 'Create Tour Slot' },
        ]}
      />

      <PageHeader
        title="Create Tour Slot"
        extra={
          <>
            <AppButton variant="secondary" onClick={() => navigate(ROUTES.CALENDAR)}>
              Cancel
            </AppButton>
            <AppButton onClick={() => void handlePublish()} disabled={isSubmitting}>
              {isSubmitting ? 'Publishing…' : 'Publish Slot'}
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
