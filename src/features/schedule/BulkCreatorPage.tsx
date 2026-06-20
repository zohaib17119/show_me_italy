import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MinusOutlined } from '@ant-design/icons';
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
import { BULK_PREVIEW_MORE_COUNT, BULK_PREVIEW_ROWS } from '@/mocks';
import styles from './schedule.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEPPER_STEPS = [
  { label: 'Date Range', status: 'done' as const },
  { label: 'Days', status: 'done' as const },
  { label: 'Slots', status: 'active' as const },
  { label: 'Language', status: 'wait' as const },
  { label: 'Review', status: 'wait' as const },
];

const LANGUAGE_OPTIONS = [{ value: 'EN', label: '🇬🇧 English' }];

export function BulkCreatorPage() {
  const navigate = useNavigate();
  const [selectedDays, setSelectedDays] = useState<Set<string>>(
    () => new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
  );

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px 16px',
                marginBottom: 12,
              }}
            >
              <FormInput label="From Date" type="date" defaultValue="2026-04-20" />
              <FormInput label="To Date" type="date" defaultValue="2026-05-20" />
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
              <AppButton variant="secondary" size="xs">
                + Add Row
              </AppButton>
            </div>

            <div className={styles.timeSlotRow}>
              <FormInput type="time" defaultValue="09:00" />
              <FormInput type="time" defaultValue="11:30" />
              <FormSelect options={LANGUAGE_OPTIONS} defaultValue="EN" />
              <IconButton icon={<MinusOutlined />} variant="danger" aria-label="Remove slot" />
            </div>
          </AppCard>
          </div>

          <div className={styles.footerActions}>
            <AppButton variant="secondary">Clear</AppButton>
            <AppButton onClick={() => showToast('✓ 28 slots created!')}>
              Create All (28 Slots) →
            </AppButton>
          </div>
        </div>

        <AppCard>
          <SectionTitle style={{ marginBottom: 12 }}>Preview</SectionTitle>
          <div className={styles.previewList}>
            {BULK_PREVIEW_ROWS.map((row) => (
              <ImportPreviewRow
                key={row.id}
                title={row.dateLabel}
                sub={`${row.startTime}–${row.endTime}`}
                conflict={row.status === 'overlap'}
                tag={
                  <>
                    <LangChip code={row.language} />
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>
                      {row.guidesNeeded} guides
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        marginLeft: 6,
                        color: row.status === 'overlap' ? '#92400e' : 'var(--g700)',
                      }}
                    >
                      {row.status === 'overlap' ? 'Overlap' : 'Ready'}
                    </span>
                  </>
                }
              />
            ))}
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '8px 0',
              }}
            >
              + {BULK_PREVIEW_MORE_COUNT} more slots…
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
