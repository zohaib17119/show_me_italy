import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from 'antd';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/constants/routes';
import { selectEventsByDate } from '@/features/tour/tourSlice';
import { languageColors } from '@/theme/tokens';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WeekMini() {
  const navigate = useNavigate();
  const eventsByDate = useAppSelector(selectEventsByDate);

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const events = eventsByDate[dateKey] ?? [];
      const isToday = dateKey === today.toISOString().slice(0, 10);
      return {
        label: DAY_LABELS[d.getDay()],
        num: d.getDate(),
        today: isToday,
        hasTour: events.length > 0,
        dots: events.slice(0, 4).map((e) => (e.unfilled ? 'RED' : e.language)),
      };
    });
  }, [eventsByDate]);

  return (
    <Card id="weekMini" styles={{ body: { padding: 16 } }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-secondary)',
          marginBottom: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>This Week</span>
        <Button size="small" onClick={() => navigate(ROUTES.CALENDAR)}>
          View →
        </Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {weekDays.map((d) => (
          <div
            key={`${d.label}-${d.num}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>
              {d.label}
            </span>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                background: d.today ? '#27AE60' : d.hasTour ? '#e0f5e9' : 'transparent',
                color: d.today ? 'white' : d.hasTour ? '#166534' : 'var(--text-secondary)',
              }}
            >
              {d.num}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                minHeight: 8,
              }}
            >
              {d.dots.map((dot, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background:
                      dot === 'RED' ? '#E74C3C' : (languageColors[dot as keyof typeof languageColors] ?? '#6B8C75'),
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
