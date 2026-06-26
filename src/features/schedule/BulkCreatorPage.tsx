import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MinusOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { buildTourSlotPayload } from '@/api/mappers/tourMapper';
import { formatLocalDateKey } from '@/api/utils/date';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  FilterChip,
  FormInput,
  FormSelect,
  IconButton,
  ImportPreviewRow,
  LangChip,
  SectionLabel,
  SectionTitle,
  Stepper,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import { createTourSlot } from '@/features/tour/tourSlice';
import { fetchTourTypes, selectActiveTourTypes } from '@/features/tourType/tourTypeSlice';
import styles from './schedule.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEPPER_STEPS = [
  { label: 'Date Range', status: 'done' as const },
  { label: 'Days', status: 'done' as const },
  { label: 'Slots', status: 'active' as const },
  { label: 'Language', status: 'wait' as const },
  { label: 'Review', status: 'wait' as const },
];

export function BulkCreatorPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const languages = useAppSelector(selectActiveLanguages);

  const [fromDate, setFromDate] = useState('2026-07-15');
  const [toDate, setToDate] = useState('2026-07-22');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:30');
  const [languageId, setLanguageId] = useState(0);
  const [tourTypeId, setTourTypeId] = useState(0);
  const [guidesNeeded, setGuidesNeeded] = useState(2);
  const [payRate, setPayRate] = useState(70);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    () => new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
  );

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
  }, [dispatch]);

  useEffect(() => {
    if (tourTypes.length > 0 && tourTypeId === 0) {
      setTourTypeId(tourTypes[0].tourTypeId ?? 0);
    }
    if (languages.length > 0 && languageId === 0) {
      setLanguageId(languages[0].languageId ?? 0);
    }
  }, [tourTypes, languages, tourTypeId, languageId]);

  const previewSlots = useMemo(() => {
    const slots: { id: string; dateLabel: string; date: string; startTime: string; endTime: string; language: string; guidesNeeded: number }[] = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const lang = languages.find((l) => l.languageId === languageId);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayName = dayMap[d.getDay()];
      if (!selectedDays.has(dayName)) continue;
      const date = formatLocalDateKey(d.getFullYear(), d.getMonth(), d.getDate());
      slots.push({
        id: date,
        dateLabel: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        date,
        startTime,
        endTime,
        language: lang?.code?.slice(0, 2).toUpperCase() ?? 'EN',
        guidesNeeded,
      });
    }
    return slots;
  }, [fromDate, toDate, selectedDays, startTime, endTime, languageId, languages, guidesNeeded]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const handleCreateAll = async () => {
    if (!tourTypeId || !languageId || previewSlots.length === 0) {
      showToast('Configure tour type, language, and date range');
      return;
    }

    setSubmitting(true);
    let created = 0;
    try {
      for (const slot of previewSlots) {
        const payload = buildTourSlotPayload({
          tourTypeId,
          slotDate: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          languageId,
          guidesNeeded,
          guestCount: 20,
          payRatePerHour: payRate,
          meetingPoint: tourTypes.find((t) => t.tourTypeId === tourTypeId)?.meetingPointAddress ?? '',
          adminNotes: 'Bulk created slot',
          status: 'Open',
        });
        await dispatch(createTourSlot(payload)).unwrap();
        created += 1;
      }
      showToast(`✓ ${created} slots created!`);
      navigate(ROUTES.CALENDAR);
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Created ${created} before error`);
    } finally {
      setSubmitting(false);
    }
  };

  const languageOptions = languages.map((l) => ({
    value: String(l.languageId),
    label: l.name ?? l.code ?? '',
  }));

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

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px 16px',
                  marginBottom: 12,
                }}
              >
                <FormInput label="From Date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                <FormInput label="To Date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>

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

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <SectionLabel style={{ margin: 0 }}>Time Slots</SectionLabel>
              </div>

              <div className={styles.timeSlotRow}>
                <FormInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <FormInput type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                <FormSelect
                  options={languageOptions}
                  value={String(languageId)}
                  onChange={(e) => setLanguageId(Number(e.target.value))}
                />
                <IconButton icon={<MinusOutlined />} variant="danger" aria-label="Remove slot" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <FormInput
                  label="Guides Needed"
                  type="number"
                  value={guidesNeeded}
                  onChange={(e) => setGuidesNeeded(Number(e.target.value))}
                />
                <FormInput
                  label="Pay Rate (€)"
                  type="number"
                  value={payRate}
                  onChange={(e) => setPayRate(Number(e.target.value))}
                />
              </div>
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
          <div className={styles.previewList}>
            {previewSlots.slice(0, 8).map((row) => (
              <ImportPreviewRow
                key={row.id}
                title={row.dateLabel}
                sub={`${row.startTime}–${row.endTime}`}
                tag={
                  <>
                    <LangChip code={row.language as 'EN'} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>
                      {row.guidesNeeded} guides
                    </span>
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
