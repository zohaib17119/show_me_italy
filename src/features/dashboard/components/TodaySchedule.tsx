import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useAppSelector } from '@/app/hooks';
import { LangChip } from '@/components/ui/LangChip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { selectTodayTours } from '@/features/tour/tourSlice';
import { languageColors } from '@/theme/tokens';
import styles from '../dashboard.module.css';

export function TodaySchedule() {
  const navigate = useNavigate();
  const todayTours = useAppSelector(selectTodayTours);
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className={styles.scheduleCard} id="scheduleCard">
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleTitle}>Today&apos;s Schedule</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={styles.scheduleDatePill}>
            {todayLabel} · {todayTours.length} tours
          </span>
          <Button size="small" onClick={() => navigate(ROUTES.CALENDAR)}>
            Full Calendar →
          </Button>
        </div>
      </div>
      {todayTours.length === 0 && (
        <div style={{ padding: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          No tours scheduled for today
        </div>
      )}
      {todayTours.map((item, i) => {
        const color = languageColors[item.language] ?? '#6B8C75';
        const isLast = i === todayTours.length - 1;
        const timeParts = item.label.split(' ');
        const time = timeParts[0] ?? '—';
        const tourName = timeParts.slice(1).join(' ');
        return (
          <div
            key={item.id}
            className={styles.tl2Row}
            style={item.unfilled ? { background: '#fff9f8' } : undefined}
          >
            <div className={styles.tl2TimeCol}>
              <div
                className={styles.tl2Time}
                style={item.unfilled ? { color: '#E74C3C' } : undefined}
              >
                {time}
              </div>
            </div>
            <div className={styles.tl2DotCol}>
              <div
                className={styles.tl2Dot}
                style={{
                  background: item.unfilled ? '#E74C3C' : color,
                  boxShadow: item.unfilled ? undefined : `0 0 0 3px ${color}26`,
                }}
              />
              {!isLast && <div className={styles.tl2Line} />}
            </div>
            <div className={styles.tl2Content}>
              <div
                className={styles.tl2TourName}
                style={item.unfilled ? { color: '#E74C3C' } : undefined}
              >
                {tourName}
                <LangChip code={item.language} />
              </div>
              <div
                className={styles.tl2Meta}
                style={item.unfilled ? { color: '#E74C3C' } : undefined}
              >
                {item.unfilled
                  ? '⚠ No guide assigned — needs assignment'
                  : item.slot.meetingPoint ?? 'Meeting point TBD'}
              </div>
              <div className={styles.tl2StatusRow}>
                <StatusBadge status={item.unfilled ? 'unfilled' : 'confirmed'} />
                {item.unfilled && (
                  <Button
                    danger
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(ROUTES.ASSIGNMENT);
                    }}
                  >
                    Assign →
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
