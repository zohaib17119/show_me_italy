import { useEffect, useMemo, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
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
import { ROUTES } from '@/constants/routes';
import {
  fetchPendingApplicationCounts,
  selectApplicationCalendarByDate,
  selectApplicationCalendarError,
  selectApplicationCalendarStatus,
} from '@/features/applications/applicationsSlice';
import { ApplicationsDaySlotsDrawer } from '@/features/applications/components/ApplicationsDaySlotsDrawer';
import { CalDayCard } from '@/features/schedule/components/CalDayCard';
import { buildMonthGrid } from '@/features/schedule/utils/buildMonthGrid';
import styles from '@/features/schedule/schedule.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function ApplicationsCalendarPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.APPLICATIONS);
  const summariesByDate = useAppSelector(selectApplicationCalendarByDate);
  const status = useAppSelector(selectApplicationCalendarStatus);
  const error = useAppSelector(selectApplicationCalendarError);

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
                    onClick={() => setSelectedDate(cell.date)}
                  />
                ))}
              </div>
            </div>
          </div>
        </AppCard>
      )}

      <ApplicationsDaySlotsDrawer
        open={selectedDate != null}
        dateKey={selectedDate}
        onClose={() => setSelectedDate(null)}
        onMutated={() => void dispatch(fetchPendingApplicationCounts())}
      />
    </div>
  );
}
