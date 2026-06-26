import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { buildTourSlotPayload } from '@/api/mappers/tourMapper';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  FormGrid,
  FormInput,
  FormSelect,
  FormTextarea,
  PreviewCard,
  SectionTitle,
  ToggleRow,
  formGridSpanFull,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import {
  createTourSlot,
  selectTourMutationStatus,
} from '@/features/tour/tourSlice';
import { fetchTourTypes, selectActiveTourTypes } from '@/features/tourType/tourTypeSlice';
import { languageColors } from '@/theme/tokens';
import styles from './schedule.module.css';

const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

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
  const [guidesNeeded, setGuidesNeeded] = useState(2);
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
  const langCode = selectedLanguage?.code?.slice(0, 2).toUpperCase() ?? 'EN';

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
      guidesNeeded,
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
        <div className={styles.twoColWide}>
          <AppCard>
            <FormGrid>
              <div className={formGridSpanFull}>
                <FormSelect
                  label="Tour Type"
                  options={tourTypeOptions}
                  value={String(tourTypeId)}
                  onChange={(e) => setTourTypeId(Number(e.target.value))}
                />
              </div>
              <FormInput
                label="Date"
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
              <FormSelect
                label="Language"
                options={languageOptions}
                value={String(languageId)}
                onChange={(e) => setLanguageId(Number(e.target.value))}
              />
              <FormInput
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <FormInput
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
              <FormInput
                label="Guides Needed"
                type="number"
                value={guidesNeeded}
                onChange={(e) => setGuidesNeeded(Number(e.target.value))}
              />
              <FormInput
                label="Group Size"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              />
              <FormInput
                label="Pay Rate (€)"
                type="number"
                value={payRatePerHour}
                onChange={(e) => setPayRatePerHour(Number(e.target.value))}
              />
              <div className={formGridSpanFull}>
                <FormInput
                  label="Meeting Point"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                />
              </div>
              <div className={formGridSpanFull}>
                <FormTextarea
                  label="Admin Notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
              <FormSelect
                label="Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </FormGrid>
          </AppCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AppCard>
              <SectionTitle style={{ marginBottom: 12 }}>Live Preview</SectionTitle>
              <PreviewCard title={selectedTourType?.name ?? 'Tour'}>
                <div
                  className={styles.previewAccent}
                  style={{ background: languageColors[langCode] ?? languageColors.EN }}
                />
                <div className={styles.previewMetaRow}>
                  <span className={styles.previewBadge}>{langCode}</span>
                  <span className={styles.previewBadge}>📅 {slotDate}</span>
                  <span className={styles.previewBadge}>
                    🕙 {startTime}–{endTime}
                  </span>
                  <span className={styles.previewBadge}>👥 max {guestCount}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {meetingPoint}</div>
                <div className={styles.previewPrice}>€{payRatePerHour.toFixed(2)}</div>
              </PreviewCard>
            </AppCard>

            <AppCard>
              <SectionTitle style={{ marginBottom: 10 }}>Options</SectionTitle>
              <ToggleRow
                label="Open for Applications"
                description="Guides can apply immediately"
                checked={openApplications}
                onCheckedChange={setOpenApplications}
              />
              <ToggleRow
                label="Send Push Notification"
                description="Alert matching language guides"
                checked={sendNotification}
                onCheckedChange={setSendNotification}
              />
            </AppCard>
          </div>
        </div>
      )}
    </div>
  );
}
