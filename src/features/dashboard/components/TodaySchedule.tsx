import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LangChip } from '@/components/ui/LangChip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ROUTES } from '@/constants/routes';
import { languageColors } from '@/theme/tokens';
import styles from '../dashboard.module.css';

interface ScheduleItem {
  time: string;
  tour: string;
  lang: string;
  meta: string;
  status: 'confirmed' | 'unfilled' | 'pending';
  guide?: string;
  alert?: boolean;
}

const schedule: ScheduleItem[] = [
  {
    time: '09:00',
    tour: 'Colosseum Arena',
    lang: 'EN',
    meta: 'Marco Rossi · 18 guests · Basilica Santi Cosma e Damiano',
    status: 'confirmed',
  },
  {
    time: '10:30',
    tour: 'Colosseum Arena',
    lang: 'IT',
    meta: 'Sofia Conti · 22 guests',
    status: 'confirmed',
  },
  {
    time: '13:00',
    tour: 'Colosseum Arena',
    lang: 'FR',
    meta: 'Amélie Dubois · 15 guests',
    status: 'confirmed',
  },
  {
    time: '14:30',
    tour: 'Colosseum Arena',
    lang: 'ES',
    meta: '⚠ No guide assigned — 24h warning',
    status: 'unfilled',
    alert: true,
  },
  {
    time: '16:00',
    tour: 'Colosseum Arena',
    lang: 'DE',
    meta: 'Hans Müller · 20 guests',
    status: 'pending',
  },
];

export function TodaySchedule() {
  const navigate = useNavigate();

  return (
    <div className={styles.scheduleCard} id="scheduleCard">
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleTitle}>Today&apos;s Schedule</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={styles.scheduleDatePill}>Wed 14 Apr · 8 tours</span>
          <Button size="small" onClick={() => navigate(ROUTES.CALENDAR)}>
            Full Calendar →
          </Button>
        </div>
      </div>
      {schedule.map((item, i) => {
        const color = languageColors[item.lang] ?? '#6B8C75';
        const isLast = i === schedule.length - 1;
        return (
          <div
            key={item.time}
            className={styles.tl2Row}
            style={item.alert ? { background: '#fff9f8' } : undefined}
          >
            <div className={styles.tl2TimeCol}>
              <div
                className={styles.tl2Time}
                style={item.alert ? { color: '#E74C3C' } : undefined}
              >
                {item.time}
              </div>
            </div>
            <div className={styles.tl2DotCol}>
              <div
                className={styles.tl2Dot}
                style={{
                  background: item.alert ? '#E74C3C' : color,
                  boxShadow: item.alert
                    ? undefined
                    : `0 0 0 3px ${color}26`,
                  animation: item.alert ? 'pulse-ring 2s infinite' : undefined,
                }}
              />
              {!isLast && <div className={styles.tl2Line} />}
            </div>
            <div className={styles.tl2Content}>
              <div
                className={styles.tl2TourName}
                style={item.alert ? { color: '#E74C3C' } : undefined}
              >
                {item.tour}
                <LangChip code={item.lang} />
              </div>
              <div
                className={styles.tl2Meta}
                style={item.alert ? { color: '#E74C3C' } : undefined}
              >
                {item.meta}
              </div>
              <div className={styles.tl2StatusRow}>
                <StatusBadge status={item.status} />
                {item.alert && (
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
