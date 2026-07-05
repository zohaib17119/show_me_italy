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

export function CreateTourPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const languages = useAppSelector(selectActiveLanguages);
  const mutationStatus = useAppSelector(selectTourMutationStatus);

  const [tourTypeId, setTourTypeId] = useState<number>(0);
  const [languageId, setLanguageId] = useState<number>(0);
  const [slotDate, setSlotDate] = useState('2026-07-15');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:30');
  const [guestCount, setGuestCount] = useState(20);
  const [payRatePerHour, setPayRatePerHour] = useState(70);
  const [meetingPoint, setMeetingPoint] = useState(
    'Basilica Santi Cosma e Damiano, Via dei Fori Imperiali 1, Rome',
  );
  const [adminNotes, setAdminNotes] = useState(
    'Please arrive 15 minutes early. Bring your official guide badge.',
  );
  const [status, setStatus] = useState('Open');
  const [openApplications, setOpenApplications] = useState(true);
  const [sendNotification, setSendNotification] = useState(true);

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
  }, [dispatch]);

  useEffect(() => {
    if (tourTypes.length > 0 && tourTypeId === 0) {
      setTourTypeId(tourTypes[0].tourTypeId ?? 0);
    }
  }, [tourTypes, tourTypeId]);

  useEffect(() => {
    if (languages.length > 0 && languageId === 0) {
      setLanguageId(languages[0].languageId ?? 0);
    }
  }, [languages, languageId]);

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

  const handlePublish = async () => {
    if (!tourTypeId || !languageId) {
      showToast('Select tour type and language');
      return;
    }

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
          onTourTypeIdChange={setTourTypeId}
          onLanguageIdChange={setLanguageId}
          onSlotDateChange={setSlotDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
          onGuestCountChange={setGuestCount}
          onPayRatePerHourChange={setPayRatePerHour}
          onMeetingPointChange={setMeetingPoint}
          onAdminNotesChange={setAdminNotes}
          onStatusChange={setStatus}
          onOpenApplicationsChange={setOpenApplications}
          onSendNotificationChange={setSendNotification}
        />
      )}
    </div>
  );
}
