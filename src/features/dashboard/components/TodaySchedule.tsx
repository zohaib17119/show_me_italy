import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { useAppSelector } from '@/app/hooks';
import { LangChip } from '@/components/ui/LangChip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';
import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';
import styles from '../dashboard.module.css';

function languageToCode(language?: string): LangCode {
  const map: Record<string, LangCode> = {
    english: 'EN',
    italian: 'IT',
    french: 'FR',
    spanish: 'ES',
    german: 'DE',
    japanese: 'JA',
  };
  return map[language?.toLowerCase() ?? ''] ?? 'EN';
}

export function TodaySchedule() {
  const navigate = useNavigate();
  const dashboard = useAppSelector(selectDashboardData);
  const schedule = dashboard?.todaySchedule;
  const tours = schedule?.tours ?? [];
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
            {todayLabel} · {schedule?.totalTours ?? tours.length} tours
          </span>
          <Button size="small" onClick={() => navigate(ROUTES.CALENDAR)}>
            Full Calendar →
          </Button>
        </div>
      </div>
      {tours.length === 0 && (
        <div style={{ padding: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          No tours scheduled for today
        </div>
      )}
      {tours.map((item, i) => {
        const langCode = languageToCode(item.language);
        const color = languageColors[langCode] ?? '#6B8C75';
        const isLast = i === tours.length - 1;
        const unfilled = !item.guideName;
        return (
          <div
            key={item.slotId ?? `${item.tourName}-${item.startTime}`}
            className={styles.tl2Row}
            style={unfilled ? { background: '#fff9f8' } : undefined}
          >
            <div className={styles.tl2TimeCol}>
              <div
                className={styles.tl2Time}
                style={unfilled ? { color: '#E74C3C' } : undefined}
              >
                {item.startTime ?? '—'}
              </div>
            </div>
            <div className={styles.tl2DotCol}>
              <div
                className={styles.tl2Dot}
                style={{
                  background: unfilled ? '#E74C3C' : color,
                  boxShadow: unfilled ? undefined : `0 0 0 3px ${color}26`,
                }}
              />
              {!isLast && <div className={styles.tl2Line} />}
            </div>
            <div className={styles.tl2Content}>
              <div
                className={styles.tl2TourName}
                style={unfilled ? { color: '#E74C3C' } : undefined}
              >
                {item.tourName ?? 'Tour'}
                <LangChip code={langCode} />
              </div>
              <div
                className={styles.tl2Meta}
                style={unfilled ? { color: '#E74C3C' } : undefined}
              >
                {unfilled
                  ? '⚠ No guide assigned — needs assignment'
                  : `${item.guideName} · ${item.language ?? '—'}`}
              </div>
              <div className={styles.tl2StatusRow}>
                <StatusBadge status={unfilled ? 'unfilled' : 'confirmed'} />
                {unfilled && (
                  <Button
                    danger
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(ROUTES.GUIDE_SLOTS);
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
