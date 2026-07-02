import type { ApplicationCalendarDaySummary } from '@/api/mappers/applicationCalendarMapper';
import type { CalendarDaySummary } from '@/api/mappers/calendarSummaryMapper';
import styles from '../schedule.module.css';

interface CalDayCardBaseProps {
  day: number;
  isToday?: boolean;
  otherMonth?: boolean;
  hasData?: boolean;
  onClick: () => void;
}

type CalDayCardScheduleProps = CalDayCardBaseProps & {
  mode?: 'schedule';
  summary?: CalendarDaySummary;
};

type CalDayCardApplicationsProps = CalDayCardBaseProps & {
  mode: 'applications';
  applicationSummary?: ApplicationCalendarDaySummary;
};

export type CalDayCardProps = CalDayCardScheduleProps | CalDayCardApplicationsProps;

function isApplicationsMode(props: CalDayCardProps): props is CalDayCardApplicationsProps {
  return props.mode === 'applications';
}

export function CalDayCard(props: CalDayCardProps) {
  const { day, isToday, otherMonth, onClick } = props;
  const applicationsMode = isApplicationsMode(props);

  const hasData =
    props.hasData ??
    (applicationsMode
      ? props.applicationSummary != null
      : props.summary != null);

  return (
    <button
      type="button"
      className={[
        styles.calCell,
        styles.calDayCard,
        otherMonth && !hasData && !isToday ? styles.calCellOther : '',
        hasData && !isToday ? styles.calDayCardHasData : '',
        isToday ? styles.calDayCardToday : '',
        isToday ? styles.calDayCardFilled : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <div className={styles.calDayHeader}>
        {isToday ? (
          <div className={[styles.calDnToday, styles.calDnTodayFilled].join(' ')}>
            {day}
          </div>
        ) : (
          <span className={styles.calDn}>{day}</span>
        )}
      </div>

      {hasData && !applicationsMode && (
        <div className={styles.calDayStats}>
          <div className={styles.calStatRow}>
            <span className={styles.calStatLabel}>Tours</span>
            <span className={styles.calStatValue}>
              {props.summary?.totalTours ?? 0}
            </span>
          </div>
          <div className={styles.calStatRow}>
            <span className={styles.calStatLabel}>Tours AM</span>
            <span className={styles.calStatValue}>
              {props.summary?.amTours ?? 0}
            </span>
          </div>
          <div className={styles.calStatRow}>
            <span className={styles.calStatLabel}>Tours PM</span>
            <span className={styles.calStatValue}>
              {props.summary?.pmTours ?? 0}
            </span>
          </div>
          <div className={styles.calStatRow}>
            <span className={styles.calStatLabel}>Assigned</span>
            <span
              className={[
                styles.calStatValue,
                (props.summary?.assignedGuides ?? 0) > 0 ? styles.calStatValueGood : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {props.summary?.assignedGuides ?? 0}
            </span>
          </div>
          <div className={styles.calStatRow}>
            <span className={styles.calStatLabel}>Missing</span>
            <span
              className={[
                styles.calStatValue,
                (props.summary?.missingSlots ?? 0) > 0
                  ? styles.calStatValueWarn
                  : styles.calStatValueMuted,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {props.summary?.missingSlots ?? 0}
            </span>
          </div>
        </div>
      )}

      {hasData && applicationsMode && (
        <div className={styles.calDayStats}>
          <div className={styles.calStatRow}>
            <span className={styles.calStatLabel}>Applications</span>
            <span className={styles.calStatValue}>
              {props.applicationSummary?.applicationCount ?? 0}
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
