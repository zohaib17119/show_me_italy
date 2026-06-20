import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  FilterChip,
  IconButton,
  SectionLabel,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { CALENDAR_EVENTS_BY_DATE } from '@/mocks';
import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';
import styles from './schedule.module.css';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarDay {
  date: string;
  day: number;
  otherMonth?: boolean;
  isToday?: boolean;
}

const LANG_FILTERS: { code: LangCode; label: string }[] = [
  { code: 'EN', label: 'English' },
  { code: 'IT', label: 'Italian' },
  { code: 'FR', label: 'French' },
  { code: 'ES', label: 'Spanish' },
  { code: 'DE', label: 'German' },
  { code: 'PT', label: 'Portuguese' },
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildApril2026Grid(): CalendarDay[] {
  const days: CalendarDay[] = [
    { date: '2026-03-31', day: 31, otherMonth: true },
  ];

  for (let d = 1; d <= 30; d += 1) {
    days.push({
      date: `2026-04-${String(d).padStart(2, '0')}`,
      day: d,
      isToday: d === 14,
    });
  }

  for (let d = 1; d <= 4; d += 1) {
    days.push({
      date: `2026-05-${String(d).padStart(2, '0')}`,
      day: d,
      otherMonth: true,
    });
  }

  return days;
}

const APRIL_DAYS = buildApril2026Grid();

export function CalendarPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [enabledLangs, setEnabledLangs] = useState<Set<LangCode>>(
    () => new Set(['EN', 'IT', 'FR', 'ES', 'DE']),
  );

  const filteredEvents = useMemo(() => {
    const result: typeof CALENDAR_EVENTS_BY_DATE = {};
    for (const [date, events] of Object.entries(CALENDAR_EVENTS_BY_DATE)) {
      const visible = events.filter((ev) => enabledLangs.has(ev.language));
      if (visible.length > 0) result[date] = visible;
    }
    return result;
  }, [enabledLangs]);

  const toggleLang = (code: LangCode) => {
    setEnabledLangs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Calendar' },
        ]}
      />

      <PageHeader
        title="Master Calendar"
        subtitle="Color-coded by language · Click slot to edit"
        extra={
          <>
            <div className={styles.viewChips}>
              <FilterChip active={viewMode === 'month'} onClick={() => setViewMode('month')}>
                Month
              </FilterChip>
              <FilterChip active={viewMode === 'week'} onClick={() => setViewMode('week')}>
                Week
              </FilterChip>
              <FilterChip active={viewMode === 'day'} onClick={() => setViewMode('day')}>
                Day
              </FilterChip>
            </div>
            <AppButton onClick={() => navigate(ROUTES.CREATE_TOUR)}>+ New Tour Slot</AppButton>
          </>
        }
      />

      <div className={styles.pageGrid}>
        <AppCard
          title="April 2026"
          extra={
            <div style={{ display: 'flex', gap: 6 }}>
              <IconButton icon={<LeftOutlined />} aria-label="Previous month" />
              <IconButton icon={<RightOutlined />} aria-label="Next month" />
            </div>
          }
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              marginBottom: 4,
            }}
          >
            {WEEKDAYS.map((day) => (
              <div key={day} className={styles.calDayHd}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.calMonth}>
            {APRIL_DAYS.map((cell) => {
              const events = filteredEvents[cell.date] ?? [];
              return (
                <div
                  key={cell.date}
                  className={[
                    styles.calCell,
                    cell.otherMonth ? styles.calCellOther : '',
                    cell.isToday ? styles.calCellToday : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.calDn}>
                    {cell.isToday ? (
                      <div className={styles.calDnToday}>{cell.day}</div>
                    ) : (
                      cell.day
                    )}
                  </div>
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className={styles.calEv}
                      style={{
                        background: languageColors[ev.language],
                        opacity: ev.unfilled ? 0.75 : 1,
                      }}
                      title={ev.label}
                    >
                      {ev.label}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </AppCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AppCard padding="sm">
            <SectionLabel>Language Filter</SectionLabel>
            <div className={styles.langFilterList}>
              {LANG_FILTERS.map(({ code, label }) => (
                <label key={code} className={styles.langFilterItem}>
                  <input
                    type="checkbox"
                    checked={enabledLangs.has(code)}
                    onChange={() => toggleLang(code)}
                    style={{ accentColor: languageColors[code], width: 13, height: 13 }}
                  />
                  <span
                    className={styles.langSwatch}
                    style={{ background: languageColors[code] }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </AppCard>

          <AppCard padding="sm">
            <SectionLabel>Legend</SectionLabel>
            <div className={styles.legendList}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--g500)' }} />
                Confirmed
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: 'var(--orange)' }} />
                Pending
              </div>
              <div className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ background: 'var(--red)', opacity: 0.6 }}
                />
                Unfilled
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}
