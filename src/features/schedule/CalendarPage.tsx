import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  AppCard,
  BreadcrumbNav,
  FilterChip,
  IconButton,
  SectionLabel,
  showToast,
} from '@/components/ui';
import { formatLocalDateKey, todayLocalDateKey } from '@/api/utils/date';
import { ROUTES } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import { fetchTourTypes } from '@/features/tourType/tourTypeSlice';
import {
  fetchTours,
  selectEventsByDate,
  selectTourError,
  selectTourStatus,
} from '@/features/tour/tourSlice';
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

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const GRID_CELLS = 35;

function buildMonthGrid(year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayLocalDateKey();

  let startOffset = new Date(year, month, 1).getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  if (startOffset + daysInMonth > GRID_CELLS) {
    startOffset = Math.max(0, GRID_CELLS - daysInMonth);
  }

  const days: CalendarDay[] = [];
  const prevMonthLast = new Date(year, month, 0).getDate();

  for (let i = startOffset - 1; i >= 0; i -= 1) {
    const day = prevMonthLast - i;
    days.push({
      date: formatLocalDateKey(year, month - 1, day),
      day,
      otherMonth: true,
    });
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const date = formatLocalDateKey(year, month, d);
    days.push({ date, day: d, isToday: date === today });
  }

  let nextMonthDay = 1;
  while (days.length < GRID_CELLS) {
    days.push({
      date: formatLocalDateKey(year, month + 1, nextMonthDay),
      day: nextMonthDay,
      otherMonth: true,
    });
    nextMonthDay += 1;
  }

  return days;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const eventsByDate = useAppSelector(selectEventsByDate);
  const languages = useAppSelector(selectActiveLanguages);
  const status = useAppSelector(selectTourStatus);
  const error = useAppSelector(selectTourError);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [enabledLangs, setEnabledLangs] = useState<Set<LangCode>>(() => new Set());

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
    void dispatch(fetchTours());
  }, [dispatch]);

  useEffect(() => {
    if (languages.length > 0 && enabledLangs.size === 0) {
      setEnabledLangs(
        new Set(
          languages
            .map((l) => l.code?.slice(0, 2).toUpperCase() as LangCode)
            .filter(Boolean),
        ),
      );
    }
  }, [languages, enabledLangs.size]);

  useEffect(() => {
    if (error) showToast(error);
  }, [error]);

  const monthDays = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const filteredEvents = useMemo(() => {
    const result: typeof eventsByDate = {};
    for (const [date, events] of Object.entries(eventsByDate)) {
      const visible = events.filter((ev) => enabledLangs.has(ev.language));
      if (visible.length > 0) result[date] = visible;
    }
    return result;
  }, [eventsByDate, enabledLangs]);

  const toggleLang = (code: LangCode) => {
    setEnabledLangs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const shiftMonth = (delta: number) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
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

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      )}

      <div className={styles.pageGrid}>
        <AppCard
          title={`${MONTH_NAMES[cursor.month]} ${cursor.year}`}
          extra={
            <div style={{ display: 'flex', gap: 6 }}>
              <IconButton
                icon={<LeftOutlined />}
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
              />
              <IconButton
                icon={<RightOutlined />}
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
              />
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
            {monthDays.map((cell) => {
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
              {languages.map((lang) => {
                const code = lang.code?.slice(0, 2).toUpperCase() as LangCode;
                if (!code) return null;
                return (
                  <label key={lang.languageId} className={styles.langFilterItem}>
                    <input
                      type="checkbox"
                      checked={enabledLangs.has(code)}
                      onChange={() => toggleLang(code)}
                      style={{
                        accentColor: lang.colorHex ?? languageColors[code],
                        width: 13,
                        height: 13,
                      }}
                    />
                    <span
                      className={styles.langSwatch}
                      style={{ background: lang.colorHex ?? languageColors[code] }}
                    />
                    {lang.name}
                  </label>
                );
              })}
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
