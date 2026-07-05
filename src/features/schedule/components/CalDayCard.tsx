import type { ReactNode } from 'react';
import {
  CompassOutlined,
  FileSearchOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
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

type CalDayStatTone = 'default' | 'good' | 'warn' | 'muted';

interface CalDayStatProps {
  icon: ReactNode;
  label?: string;
  value?: number;
  children?: ReactNode;
  tone?: CalDayStatTone;
  title?: string;
}

function CalDayStat({
  icon,
  label,
  value,
  children,
  tone = 'default',
  title,
}: CalDayStatProps) {
  const iconClass = [
    styles.calStatIcon,
    tone === 'good' ? styles.calStatIconGood : '',
    tone === 'warn' ? styles.calStatIconWarn : '',
    tone === 'muted' ? styles.calStatIconMuted : '',
  ]
    .filter(Boolean)
    .join(' ');

  const valueClass = [
    styles.calStatValue,
    tone === 'good' ? styles.calStatValueGood : '',
    tone === 'warn' ? styles.calStatValueWarn : '',
    tone === 'muted' ? styles.calStatValueMuted : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.calStatRow} title={title}>
      <span className={iconClass}>{icon}</span>
      {children ?? (
        <>
          <span className={styles.calStatLabel}>{label}</span>
          <span className={valueClass}>{value ?? 0}</span>
        </>
      )}
    </div>
  );
}

function ToursStatLine({
  total,
  am,
  pm,
}: {
  total: number;
  am: number;
  pm: number;
}) {
  return (
    <span className={styles.calStatValueText}>
      <span className={styles.calStatTourCount}>{total}</span>
      {' tours ('}
      <span className={styles.calStatTourCount}>{am}</span>
      {' AM) ('}
      <span className={styles.calStatTourCount}>{pm}</span>
      {' PM)'}
    </span>
  );
}

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

  const summary = !applicationsMode ? props.summary : undefined;
  const assigned = summary?.assignedGuides ?? 0;
  const missing = summary?.missingSlots ?? 0;

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
          <CalDayStat
            icon={<CompassOutlined />}
            title="Total tours · morning · afternoon"
          >
            <ToursStatLine
              total={summary?.totalTours ?? 0}
              am={summary?.amTours ?? 0}
              pm={summary?.pmTours ?? 0}
            />
          </CalDayStat>
          <CalDayStat
            icon={<TeamOutlined />}
            label="Assigned"
            value={assigned}
            tone={assigned > 0 ? 'good' : 'default'}
            title="Guides assigned"
          />
          <CalDayStat
            icon={<WarningOutlined />}
            label="Missing"
            value={missing}
            tone={missing > 0 ? 'warn' : 'muted'}
            title="Missing guide slots"
          />
        </div>
      )}

      {hasData && applicationsMode && (
        <div className={styles.calDayStats}>
          <CalDayStat
            icon={<FileSearchOutlined />}
            label="Pending"
            value={props.applicationSummary?.applicationCount ?? 0}
            title="Pending applications"
          />
        </div>
      )}
    </button>
  );
}
