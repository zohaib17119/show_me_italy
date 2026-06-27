import { useEffect, useMemo, useRef, useState } from 'react';
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
  ListErrorState,
  SectionLabel,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import {
  addDaysToDateKey,
  formatLocalDateKey,
  todayLocalDateKey,
} from '@/api/utils/date';
import { ROUTES, getTourDetailPath } from '@/constants/routes';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import {
  fetchTourTypes,
  selectActiveTourTypes,
} from '@/features/tourType/tourTypeSlice';
import {
  fetchTours,
  selectEventsByDate,
  selectTourError,
  selectTourStatus,
} from '@/features/tour/tourSlice';
import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';
import {
  buildTourSlotFilter,
  calendarTitle,
  tourSlotFilterKey,
  type CalendarViewMode,
} from './calendarFilter';
import styles from './schedule.module.css';

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
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const status = useAppSelector(selectTourStatus);
  const error = useAppSelector(selectTourError);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(todayLocalDateKey);
  const [enabledLangs, setEnabledLangs] = useState<Set<LangCode>>(() => new Set());
  const [enabledTourTypeIds, setEnabledTourTypeIds] = useState<Set<number>>(() => new Set());
  const [filtersReady, setFiltersReady] = useState(false);

  useFetchErrorToast(status, error);

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
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
    if (tourTypes.length > 0 && enabledTourTypeIds.size === 0) {
      setEnabledTourTypeIds(
        new Set(tourTypes.map((t) => t.tourTypeId).filter((id): id is number => id != null)),
      );
    }
  }, [tourTypes, enabledTourTypeIds.size]);

  useEffect(() => {
    setFiltersReady(enabledLangs.size > 0 && enabledTourTypeIds.size > 0);
  }, [enabledLangs.size, enabledTourTypeIds.size]);

  const enabledLangKey = useMemo(
    () => [...enabledLangs].sort().join(','),
    [enabledLangs],
  );
  const enabledTourTypeKey = useMemo(
    () => [...enabledTourTypeIds].sort((a, b) => a - b).join(','),
    [enabledTourTypeIds],
  );

  const monthDays = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const monthGridDates = useMemo(() => monthDays.map((cell) => cell.date), [monthDays]);

  const tourFilter = useMemo(
    () =>
      buildTourSlotFilter({
        viewMode,
        monthGridDates,
        selectedDate,
        enabledLangs,
        enabledTourTypeIds,
        languages,
        tourTypes,
      }),
    [
      viewMode,
      monthGridDates,
      selectedDate,
      enabledLangKey,
      enabledTourTypeKey,
      languages,
      tourTypes,
      enabledLangs,
      enabledTourTypeIds,
    ],
  );

  const filterKey = useMemo(() => tourSlotFilterKey(tourFilter), [tourFilter]);
  const tourFilterRef = useRef(tourFilter);
  tourFilterRef.current = tourFilter;

  useEffect(() => {
    if (viewMode === 'month') return;
    const [y, m] = selectedDate.split('-').map(Number);
    setCursor((prev) => {
      if (prev.year === y && prev.month === m - 1) return prev;
      return { year: y, month: m - 1 };
    });
  }, [selectedDate, viewMode]);

  useEffect(() => {
    if (!filtersReady) return;
    void dispatch(fetchTours(tourFilterRef.current));
  }, [dispatch, filterKey, filtersReady]);

  const toggleLang = (code: LangCode) => {
    setEnabledLangs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleTourType = (tourTypeId: number) => {
    setEnabledTourTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(tourTypeId)) next.delete(tourTypeId);
      else next.add(tourTypeId);
      return next;
    });
  };

  const shiftMonth = (delta: number) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const shiftWeek = (delta: number) => {
    setSelectedDate((prev) => addDaysToDateKey(prev, delta * 7));
  };

  const shiftDay = (delta: number) => {
    setSelectedDate((prev) => addDaysToDateKey(prev, delta));
  };

  const handlePrev = () => {
    if (viewMode === 'month') shiftMonth(-1);
    else if (viewMode === 'week') shiftWeek(-1);
    else shiftDay(-1);
  };

  const handleNext = () => {
    if (viewMode === 'month') shiftMonth(1);
    else if (viewMode === 'week') shiftWeek(1);
    else shiftDay(1);
  };

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
    if (mode !== 'month') {
      setSelectedDate(todayLocalDateKey());
    }
  };

  const navLabel =
    viewMode === 'month'
      ? 'month'
      : viewMode === 'week'
        ? 'week'
        : 'day';

  const cardTitle = calendarTitle(viewMode, cursor, selectedDate, MONTH_NAMES);

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
              <FilterChip
                active={viewMode === 'month'}
                onClick={() => handleViewModeChange('month')}
              >
                Month
              </FilterChip>
              <FilterChip
                active={viewMode === 'week'}
                onClick={() => handleViewModeChange('week')}
              >
                Week
              </FilterChip>
              <FilterChip
                active={viewMode === 'day'}
                onClick={() => handleViewModeChange('day')}
              >
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

      {status === 'failed' && (
        <ListErrorState
          message={error}
          loading={false}
          onRetry={() => void dispatch(fetchTours(tourFilter))}
        />
      )}

      {status !== 'failed' && (
      <div className={styles.pageGrid}>
        <AppCard
          title={cardTitle}
          extra={
            <div style={{ display: 'flex', gap: 6 }}>
              <IconButton
                icon={<LeftOutlined />}
                aria-label={`Previous ${navLabel}`}
                onClick={handlePrev}
              />
              <IconButton
                icon={<RightOutlined />}
                aria-label={`Next ${navLabel}`}
                onClick={handleNext}
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
              const events = eventsByDate[cell.date] ?? [];
              return (
                <div
                  key={cell.date}
                  className={[
                    styles.calCell,
                    cell.otherMonth ? styles.calCellOther : '',
                    cell.isToday ? styles.calCellToday : '',
                    viewMode === 'day' && cell.date === selectedDate ? styles.calCellToday : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (viewMode === 'day') setSelectedDate(cell.date);
                  }}
                  role={viewMode === 'day' ? 'button' : undefined}
                  tabIndex={viewMode === 'day' ? 0 : undefined}
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
                        cursor: 'pointer',
                      }}
                      title={ev.label}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        const tourSlotId = ev.slot.tourSlotId ?? Number(ev.id);
                        if (tourSlotId) navigate(getTourDetailPath(tourSlotId));
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.stopPropagation();
                        const tourSlotId = ev.slot.tourSlotId ?? Number(ev.id);
                        if (tourSlotId) navigate(getTourDetailPath(tourSlotId));
                      }}
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
            <SectionLabel>Tour Type Filter</SectionLabel>
            <div className={styles.langFilterList}>
              {tourTypes.map((tour) => {
                const id = tour.tourTypeId;
                if (id == null) return null;
                return (
                  <label key={id} className={styles.langFilterItem}>
                    <input
                      type="checkbox"
                      checked={enabledTourTypeIds.has(id)}
                      onChange={() => toggleTourType(id)}
                      style={{ width: 13, height: 13 }}
                    />
                    <span style={{ fontSize: 14 }}>🏛️</span>
                    {tour.name ?? `Tour #${id}`}
                  </label>
                );
              })}
            </div>
          </AppCard>
        </div>
      </div>
      )}
    </div>
  );
}
