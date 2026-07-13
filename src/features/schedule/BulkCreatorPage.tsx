import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { buildBulkTourSlotPayload } from '@/api/mappers/tourMapper';
import { formatLocalDateKey } from '@/api/utils/date';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  FilterChip,
  FormGrid,
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormTextarea,
  ImportPreviewRow,
  LangChip,
  SectionLabel,
  SectionTitle,
  Stepper,
  formGridSpanFull,
  showToast,
} from '@/components/ui';
import type { FormSelectOption } from '@/components/ui/forms/FormSelect';
import { ROUTES } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import { createBulkTourSlots } from '@/features/tour/tourSlice';
import { fetchTourTypes, selectActiveTourTypes } from '@/features/tourType/tourTypeSlice';
import type { LangCode } from '@/types';
import {
  hasFieldErrors,
  validateBulkTourSlots,
  type TourSlotFieldErrors,
} from './utils/tourSlotValidation';
import { TourTicketField } from './components/TourTicketField';
import styles from './schedule.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEPPER_STEPS = [
  { label: 'Date Range', status: 'done' as const },
  { label: 'Days', status: 'done' as const },
  { label: 'Slots', status: 'active' as const },
  { label: 'Language', status: 'wait' as const },
  { label: 'Review', status: 'wait' as const },
];

const STATUS_OPTIONS: FormSelectOption[] = [
  { value: 'Open', label: 'Open' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export function BulkCreatorPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const languages = useAppSelector(selectActiveLanguages);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [languageIds, setLanguageIds] = useState<number[]>([]);
  const [tourTypeId, setTourTypeId] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [payRate, setPayRate] = useState(0);
  const [meetingPoint, setMeetingPoint] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('Open');
  const [tickets, setTickets] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    () => new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
  );
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
        label: l.name ?? l.code ?? '',
      })),
    [languages],
  );

  const selectedTourTypeName =
    tourTypes.find((t) => t.tourTypeId === tourTypeId)?.name ?? 'Tour';

  const handleTourTypeChange = (id: number) => {
    clearFieldError('tourTypeId');
    setTourTypeId(id);
    const type = tourTypes.find((t) => t.tourTypeId === id);
    setMeetingPoint(type?.meetingPointAddress?.trim() ?? '');
    setPayRate(type?.basePrice ?? 0);
    if (type?.meetingPointAddress?.trim()) {
      clearFieldError('meetingPoint');
    }
  };

  const selectedDates = useMemo(() => {
    if (!fromDate || !toDate) return [] as string[];

    const dates: string[] = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return [];
    }

    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = dayMap[d.getDay()];
      if (!selectedDays.has(dayName)) continue;
      dates.push(formatLocalDateKey(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    return dates;
  }, [fromDate, toDate, selectedDays]);

  const previewSlots = useMemo(() => {
    if (!startTime || !endTime || selectedDates.length === 0 || languageIds.length === 0) {
      return [];
    }

    const slots: {
      id: string;
      dateLabel: string;
      date: string;
      startTime: string;
      endTime: string;
      language: LangCode;
    }[] = [];

    for (const date of selectedDates) {
      const [y, m, d] = date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dateLabel = dateObj.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      for (const languageId of languageIds) {
        const lang = languages.find((l) => l.languageId === languageId);
        slots.push({
          id: `${date}-${languageId}`,
          dateLabel,
          date,
          startTime,
          endTime,
          language: (lang?.code?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode,
        });
      }
    }

    return slots;
  }, [selectedDates, startTime, endTime, languageIds, languages]);

  const toggleDay = (day: string) => {
    clearFieldError('selectedDays');
    clearFieldError('previewSlots');
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleCreateAll = async () => {
    const errors = validateBulkTourSlots({
      tourTypeId,
      languageIds,
      fromDate,
      toDate,
      startTime,
      endTime,
      meetingPoint,
      guestCount,
      selectedDaysCount: selectedDays.size,
      previewSlotCount: previewSlots.length,
    });
    setFieldErrors(errors);
    if (hasFieldErrors(errors)) return;

    const totalSlots = previewSlots.length;
    setSubmitting(true);
    try {
      const payload = buildBulkTourSlotPayload({
        tourTypeId,
        dates: selectedDates,
        languageIds,
        startTime,
        endTime,
        guidesNeeded: 1,
        guestCount,
        payRatePerHour: payRate,
        meetingPoint,
        adminNotes,
        status,
        tickets,
      });
      await dispatch(createBulkTourSlots(payload)).unwrap();
      showToast(`✓ ${totalSlots} slots created!`);
      navigate(ROUTES.CALENDAR);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create tour slots');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Schedule', onClick: () => navigate(ROUTES.CALENDAR) },
          { label: 'Bulk Creator' },
        ]}
      />

      <PageHeader title="Bulk Schedule Creator" />

      <div className={styles.bulkGrid}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <AppCard>
              <Stepper steps={STEPPER_STEPS} />

              <FormGrid className={styles.bulkFormGrid}>
                <FormInput
                  label="From Date"
                  type="date"
                  value={fromDate}
                  error={fieldErrors.fromDate}
                  onChange={(e) => {
                    clearFieldError('fromDate');
                    clearFieldError('previewSlots');
                    setFromDate(e.target.value);
                  }}
                />
                <FormInput
                  label="To Date"
                  type="date"
                  value={toDate}
                  error={fieldErrors.toDate}
                  onChange={(e) => {
                    clearFieldError('toDate');
                    clearFieldError('previewSlots');
                    setToDate(e.target.value);
                  }}
                />
              </FormGrid>

              <SectionLabel style={{ marginBottom: 8 }}>Days of Week</SectionLabel>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {WEEKDAYS.map((day) => (
                  <FilterChip
                    key={day}
                    active={selectedDays.has(day)}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </FilterChip>
                ))}
              </div>
              {fieldErrors.selectedDays && (
                <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600, marginBottom: 12 }}>
                  {fieldErrors.selectedDays}
                </div>
              )}

              <FormGrid className={styles.bulkFormGridMt}>
                <div className={formGridSpanFull}>
                  <FormSelect
                    label="Tour Type"
                    options={tourTypeOptions}
                    value={tourTypeId ? String(tourTypeId) : ''}
                    placeholder="Select tour type"
                    error={fieldErrors.tourTypeId}
                    onChange={(e) => handleTourTypeChange(Number(e.target.value))}
                  />
                </div>
                <FormMultiSelect
                  label="Languages"
                  options={languageOptions}
                  value={languageIds.map(String)}
                  placeholder="Select languages"
                  error={fieldErrors.languageId}
                  onChange={(values) => {
                    clearFieldError('languageId');
                    clearFieldError('previewSlots');
                    setLanguageIds(values.map(Number).filter((id) => Number.isFinite(id) && id > 0));
                  }}
                />
                <FormSelect
                  label="Status"
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                />
              </FormGrid>

              <SectionLabel style={{ marginBottom: 8, marginTop: 4 }}>Time Slots</SectionLabel>
              <div className={styles.timeSlotRow}>
                <FormInput
                  label="Start Time"
                  type="time"
                  value={startTime}
                  error={fieldErrors.startTime}
                  onChange={(e) => {
                    clearFieldError('startTime');
                    clearFieldError('previewSlots');
                    setStartTime(e.target.value);
                  }}
                />
                <FormInput
                  label="End Time"
                  type="time"
                  value={endTime}
                  error={fieldErrors.endTime}
                  onChange={(e) => {
                    clearFieldError('endTime');
                    clearFieldError('previewSlots');
                    setEndTime(e.target.value);
                  }}
                />
              </div>

              <FormGrid className={styles.bulkFormGridMt}>
                <div className={formGridSpanFull}>
                  <FormInput
                    label="Meeting Point"
                    value={meetingPoint}
                    disabled
                    error={fieldErrors.meetingPoint}
                    onChange={(e) => {
                      clearFieldError('meetingPoint');
                      setMeetingPoint(e.target.value);
                    }}
                  />
                </div>
                <FormInput
                  label="Group Size"
                  type="number"
                  value={guestCount}
                  error={fieldErrors.guestCount}
                  onChange={(e) => {
                    clearFieldError('guestCount');
                    setGuestCount(Number(e.target.value));
                  }}
                />
                <FormInput
                  label="Pay Rate (€)"
                  type="number"
                  value={payRate}
                  onChange={(e) => setPayRate(Number(e.target.value))}
                />
                <div className={formGridSpanFull}>
                  <FormTextarea
                    label="Admin Notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className={formGridSpanFull}>
                  <TourTicketField value={tickets} onChange={setTickets} />
                </div>
              </FormGrid>
            </AppCard>
          </div>

          <div className={styles.footerActions}>
            <AppButton variant="secondary" onClick={() => setSelectedDays(new Set(WEEKDAYS.slice(0, 5)))}>
              Clear
            </AppButton>
            <AppButton onClick={() => void handleCreateAll()} disabled={submitting}>
              {submitting ? 'Creating…' : `Create All (${previewSlots.length} Slots) →`}
            </AppButton>
          </div>
        </div>

        <AppCard>
          <SectionTitle style={{ marginBottom: 12 }}>Preview</SectionTitle>
          {fieldErrors.previewSlots && (
            <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 600, marginBottom: 12 }}>
              {fieldErrors.previewSlots}
            </div>
          )}
          <div className={styles.previewList}>
            {previewSlots.slice(0, 8).map((row) => (
              <ImportPreviewRow
                key={row.id}
                title={row.dateLabel}
                sub={`${selectedTourTypeName} · ${row.startTime}–${row.endTime}`}
                tag={
                  <>
                    <LangChip code={row.language} />
                    <span style={{ fontSize: 9, fontWeight: 700, marginLeft: 6, color: 'var(--g700)' }}>
                      Ready
                    </span>
                  </>
                }
              />
            ))}
            {previewSlots.length > 8 && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  padding: '8px 0',
                }}
              >
                + {previewSlots.length - 8} more slots…
              </div>
            )}
          </div>
        </AppCard>
      </div>
    </div>
  );
}
