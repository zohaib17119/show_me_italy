import { useEffect, useMemo, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppCard,
  IconButton,
  ListErrorState,
  LoadingOverlay,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES, getApplicationsQueuePath } from '@/constants/routes';
import {
  formatLocalDateKey,
  todayLocalDateKey,
} from '@/api/utils/date';
import {
  fetchPendingApplicationCounts,
  selectApplicationCalendarByDate,
  selectApplicationCalendarError,
  selectApplicationCalendarStatus,
} from '@/features/applications/applicationsSlice';
import { CalDayCard } from '@/features/schedule/components/CalDayCard';
import styles from '@/features/schedule/schedule.module.css';

interface CalendarDay {
  date: string;
  day: number;
  otherMonth?: boolean;
  isToday?: boolean;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GRID_CELLS = 35;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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

export function ApplicationsCalendarPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const meta = getRouteMeta(ROUTES.APPLICATIONS);
  const summariesByDate = useAppSelector(selectApplicationCalendarByDate);
  const status = useAppSelector(selectApplicationCalendarStatus);
  const error = useAppSelector(selectApplicationCalendarError);

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  useFetchErrorToast(status, error);

  const monthDays = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  useEffect(() => {
    void dispatch(fetchPendingApplicationCounts());
  }, [dispatch]);

  const shiftMonth = (delta: number) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  const cardTitle = `${MONTH_NAMES[cursor.month]} ${cursor.year}`;

  return (
    <div>
      <LoadingOverlay visible={status === 'loading'} />
      <PageHeader title={meta.title} subtitle={meta.subtitle} />

      {status === 'failed' && (
        <ListErrorState
          message={error}
          loading={false}
          onRetry={() => void dispatch(fetchPendingApplicationCounts())}
        />
      )}

      {status !== 'failed' && (
        <AppCard
          title={cardTitle}
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
          <div className="calMonthScroll">
            <div className="calMonthScrollInner">
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
                {monthDays.map((cell) => (
                  <CalDayCard
                    key={cell.date}
                    mode="applications"
                    day={cell.day}
                    isToday={cell.isToday}
                    otherMonth={cell.otherMonth}
                    applicationSummary={summariesByDate[cell.date]}
                    onClick={() => navigate(getApplicationsQueuePath(cell.date))}
                  />
                ))}
              </div>
            </div>
          </div>
        </AppCard>
      )}
    </div>
  );
}
