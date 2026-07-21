import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  LoadingOverlay,
  LockedAction,
  SectionLabel,
} from '@/components/ui';
import { useCan } from '@/features/auth/useCan';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import {
  addDaysToDateKey,
  getWeekRange,
  todayLocalDateKey,
} from '@/api/utils/date';
import { ROUTES } from '@/constants/routes';
import { GuideSlotsModal } from '@/features/applications/components/GuideSlotsModal';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import {
  fetchTourTypes,
  selectActiveTourTypes,
} from '@/features/tourType/tourTypeSlice';
import {
  fetchCalendarSummaries,
  selectCalendarError,
  selectCalendarStatus,
  selectCalendarSummariesByDate,
} from '@/features/tour/tourSlice';
import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';
import { CalDayCard } from './components/CalDayCard';
import {
  buildTourSlotFilter,
  calendarTitle,
  tourSlotFilterKey,
  type CalendarViewMode,
} from './calendarFilter';
import { buildMonthGrid, type MonthGridDay } from './utils/buildMonthGrid';
import styles from './schedule.module.css';

type CalendarDay = MonthGridDay;

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildWeekGrid(selectedDate: string): CalendarDay[] {
  const today = todayLocalDateKey();
  const { start } = getWeekRange(selectedDate);
  const mondayKey = start.slice(0, 10);
  const days: CalendarDay[] = [];

  for (let i = 0; i < 7; i += 1) {
    const date = addDaysToDateKey(mondayKey, i);
    const day = Number(date.slice(8, 10));
    days.push({ date, day, isToday: date === today });
  }

  return days;
}

function buildDayGrid(selectedDate: string): CalendarDay[] {
  const today = todayLocalDateKey();
  const day = Number(selectedDate.slice(8, 10));
  return [{ date: selectedDate, day, isToday: selectedDate === today }];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function CalendarPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canCreate = can('Schedule.Create');
  const dispatch = useAppDispatch();
  const summariesByDate = useAppSelector(selectCalendarSummariesByDate);
  const languages = useAppSelector(selectActiveLanguages);
  const tourTypes = useAppSelector(selectActiveTourTypes);
  const status = useAppSelector(selectCalendarStatus);
  const error = useAppSelector(selectCalendarError);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(todayLocalDateKey);
  const [enabledLangs, setEnabledLangs] = useState<Set<LangCode>>(() => new Set());
  const [enabledTourTypeIds, setEnabledTourTypeIds] = useState<Set<number>>(() => new Set());
  const [langsInitialized, setLangsInitialized] = useState(false);
  const [tourTypesInitialized, setTourTypesInitialized] = useState(false);
  const [modalDate, setModalDate] = useState<string | null>(null);

  useFetchErrorToast(status, error);

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
  }, [dispatch]);

  useEffect(() => {
    if (langsInitialized || languages.length === 0) return;
    setEnabledLangs(
      new Set(
        languages
          .map((l) => l.code?.slice(0, 2).toUpperCase() as LangCode)
          .filter(Boolean),
      ),
    );
    setLangsInitialized(true);
  }, [languages, langsInitialized]);

  useEffect(() => {
    if (tourTypesInitialized || tourTypes.length === 0) return;
    setEnabledTourTypeIds(
      new Set(tourTypes.map((t) => t.tourTypeId).filter((id): id is number => id != null)),
    );
    setTourTypesInitialized(true);
  }, [tourTypes, tourTypesInitialized]);

  const filtersReady = langsInitialized && tourTypesInitialized;

  const enabledLangKey = useMemo(
    () => [...enabledLangs].sort().join(','),
    [enabledLangs],
  );
  const enabledTourTypeKey = useMemo(
    () => [...enabledTourTypeIds].sort((a, b) => a - b).join(','),
    [enabledTourTypeIds],
  );

  const modalLanguageID = useMemo(() => {
    const ids = languages
      .filter((lang) => {
        const code = lang.code?.slice(0, 2).toUpperCase() as LangCode;
        return code && enabledLangs.has(code) && lang.languageId != null;
      })
      .map((lang) => lang.languageId as number);
    return ids.length > 0 ? ids.join(',') : '';
  }, [languages, enabledLangs]);

  const modalTourTypeIds = useMemo(
    () => (enabledTourTypeIds.size > 0 ? [...enabledTourTypeIds].sort((a, b) => a - b).join(',') : ''),
    [enabledTourTypeIds],
  );

  const monthDays = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const monthGridDates = useMemo(() => monthDays.map((cell) => cell.date), [monthDays]);

  const visibleDays = useMemo(() => {
    if (viewMode === 'month') return monthDays;
    if (viewMode === 'week') return buildWeekGrid(selectedDate);
    return buildDayGrid(selectedDate);
  }, [viewMode, monthDays, selectedDate]);

  const gridClassName =
    viewMode === 'month'
      ? styles.calMonth
      : viewMode === 'week'
        ? styles.calWeek
        : styles.calDayView;

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
    void dispatch(fetchCalendarSummaries(tourFilterRef.current));
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
      <LoadingOverlay visible={status === 'loading'} />
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Calendar' },
        ]}
      />

      <PageHeader
        title="Master Calendar"
        subtitle="Daily tour summary · Click a day to view guide slots"
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
            <LockedAction allowed={canCreate}>
              <AppButton onClick={() => navigate(ROUTES.CREATE_TOUR)}>+ New Tour Slot</AppButton>
            </LockedAction>
          </>
        }
      />

      {status === 'failed' && (
        <ListErrorState
          message={error}
          loading={false}
          onRetry={() => void dispatch(fetchCalendarSummaries(tourFilter))}
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
          <div className="calMonthScroll">
            <div className="calMonthScrollInner">
              {viewMode !== 'day' && (
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
              )}

              <div className={gridClassName}>
                {visibleDays.map((cell) => (
                  <CalDayCard
                    key={cell.date}
                    day={cell.day}
                    isToday={cell.isToday}
                    otherMonth={cell.otherMonth}
                    summary={summariesByDate[cell.date]}
                    onClick={() => setModalDate(cell.date)}
                  />
                ))}
              </div>
            </div>
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

      <GuideSlotsModal
        open={modalDate != null}
        dateKey={modalDate}
        languageID={modalLanguageID}
        tourTypeIds={modalTourTypeIds}
        onClose={() => setModalDate(null)}
      />
    </div>
  );
}
