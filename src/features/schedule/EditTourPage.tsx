import { useCallback, useEffect, useMemo, useState } from 'react';
// import { Modal, Spin } from 'antd';
import { Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
// import { getApiErrorMessage } from '@/api/axiosInstance';
import { mapTourSlotToFormValues, mergeTourSlotForUpdate } from '@/api/mappers/tourMapper';
import type { TourSlot } from '@/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BreadcrumbNav,
  ListErrorState,
  LockedAction,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
// import { applicationsApi } from '@/features/applications/applicationsApi';
// import { fetchAdminGuides, selectAdminGuides } from '@/features/agent/agentSlice';
import { useCan } from '@/features/auth/useCan';
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
  const can = useCan();
  const canEdit = can('Schedule.Edit');
  const dispatch = useAppDispatch();
  const tour = useAppSelector(selectSelectedTour);
  const detailStatus = useAppSelector(selectTourDetailStatus);
  const detailError = useAppSelector(selectTourDetailError);
  const mutationStatus = useAppSelector(selectTourMutationStatus);
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const languages = useAppSelector(selectActiveLanguages);
  // const guides = useAppSelector(selectAdminGuides);

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

  // Assigned guide dropdown / change flow (temporarily disabled)
  // const [selectedGuideId, setSelectedGuideId] = useState('');
  // const [pendingGuideId, setPendingGuideId] = useState<string | null>(null);
  // const [confirmOpen, setConfirmOpen] = useState(false);
  // const [updatingGuide, setUpdatingGuide] = useState(false);

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
    // setSelectedGuideId(String(tour.guideID ?? '').trim());
    setFormInitialized(true);
  }, [formInitialized, tour]);

  // const tourLanguageCode = useMemo(() => {
  //   if (!languageId) return '';
  //   const lang = languages.find((l) => l.languageId === languageId);
  //   return lang?.code?.trim().toUpperCase() ?? '';
  // }, [languageId, languages]);

  // useEffect(() => {
  //   if (!tourLanguageCode) return;
  //   void dispatch(fetchAdminGuides({ language: tourLanguageCode }));
  // }, [dispatch, tourLanguageCode]);

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

  // const guideOptions = useMemo(() => {
  //   const options = [
  //     { value: '', label: 'None / No guide' },
  //     ...guides.map((g) => ({
  //       value: g.id,
  //       label: g.name,
  //     })),
  //   ];
  //   const assignedId = String(originalTour?.guideID ?? selectedGuideId).trim();
  //   const assignedName = originalTour?.fullName?.trim();
  //   if (assignedId && !options.some((o) => o.value === assignedId)) {
  //     options.splice(1, 0, {
  //       value: assignedId,
  //       label: assignedName || `Guide ${assignedId.slice(0, 8)}…`,
  //     });
  //   }
  //   return options;
  // }, [guides, originalTour?.fullName, originalTour?.guideID, selectedGuideId]);

  const selectedTourType = tourTypes.find((t) => t.tourTypeId === tourTypeId);
  const selectedLanguage = languages.find((l) => l.languageId === languageId);
  const langCode = (selectedLanguage?.code?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;

  // const pendingGuideName = useMemo(() => {
  //   if (pendingGuideId == null || pendingGuideId === '') return '';
  //   return guideOptions.find((o) => o.value === pendingGuideId)?.label ?? 'this guide';
  // }, [guideOptions, pendingGuideId]);

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

  // const handleGuideSelectChange = (nextGuideId: string) => {
  //   if (nextGuideId === selectedGuideId) return;
  //   if (nextGuideId === '' && selectedGuideId === '') return;
  //   setPendingGuideId(nextGuideId);
  //   setConfirmOpen(true);
  // };

  // const closeGuideConfirm = () => {
  //   if (updatingGuide) return;
  //   setConfirmOpen(false);
  //   setPendingGuideId(null);
  // };

  // const handleConfirmGuideChange = async () => {
  //   if (pendingGuideId == null || updatingGuide || !originalTour) return;

  //   const isNone = pendingGuideId === '';
  //   const applicationId = Number(originalTour.applicationID ?? 0) || 0;
  //   const payload = isNone
  //     ? {
  //         status: 'Cancelled By Admin',
  //         guideId: '',
  //         tourSlotId,
  //         isNone: true,
  //         applicationId,
  //       }
  //     : {
  //         status: 'Approved',
  //         guideId: pendingGuideId,
  //         tourSlotId,
  //         isNone: false,
  //         applicationId,
  //       };

  //   setUpdatingGuide(true);
  //   try {
  //     await applicationsApi.updateGuideOnSelectedTour(payload);
  //     showToast(isNone ? 'Guide removed from tour' : 'Guide assigned to tour');
  //     setSelectedGuideId(pendingGuideId);
  //     setConfirmOpen(false);
  //     setPendingGuideId(null);
  //     const refreshed = await dispatch(fetchTourById(tourSlotId)).unwrap();
  //     setOriginalTour(refreshed);
  //     setSelectedGuideId(String(refreshed.guideID ?? '').trim());
  //   } catch (err) {
  //     showToast(getApiErrorMessage(err));
  //   } finally {
  //     setUpdatingGuide(false);
  //   }
  // };

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
      navigate(ROUTES.CALENDAR);
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

  // const confirmIsRemove = pendingGuideId === '';

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
            <LockedAction allowed={canEdit}>
              <AppButton onClick={() => void handleSave()} disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Edit Slot/Tour'}
              </AppButton>
            </LockedAction>
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
          // assignedGuideOptions={guideOptions}
          // assignedGuideId={selectedGuideId}
          // assignedGuideDisabled={!canEdit || updatingGuide}
          // onAssignedGuideChange={handleGuideSelectChange}
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

      {/* <Modal
        title={confirmIsRemove ? 'Remove assigned guide?' : 'Assign guide?'}
        open={confirmOpen}
        onCancel={closeGuideConfirm}
        maskClosable={!updatingGuide}
        closable={!updatingGuide}
        footer={[
          <AppButton
            key="cancel"
            variant="secondary"
            onClick={closeGuideConfirm}
            disabled={updatingGuide}
          >
            Cancel
          </AppButton>,
          <AppButton
            key="confirm"
            onClick={() => void handleConfirmGuideChange()}
            disabled={updatingGuide}
          >
            {updatingGuide ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Spin size="small" />
                Updating…
              </span>
            ) : (
              'Confirm'
            )}
          </AppButton>,
        ]}
        destroyOnClose
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          {confirmIsRemove
            ? 'Are you sure you want to remove the assigned guide from this tour?'
            : `Are you sure you want to assign this tour to ${pendingGuideName}?`}
        </p>
      </Modal> */}
    </div>
  );
}
