import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from 'antd';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/constants/routes';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';
import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function WeekMini() {
  const navigate = useNavigate();
  const dashboard = useAppSelector(selectDashboardData);
  const weekDays = dashboard?.week?.days ?? [];

  const days = useMemo(() => {
    return weekDays.map((day) => {
      const date = day.date ? new Date(day.date) : new Date();
      const dateKey = Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
      const todayKey = new Date().toISOString().slice(0, 10);
      const tourCount = day.tours ?? 0;
      return {
        label: DAY_LABELS[date.getDay()] ?? 'D',
        num: date.getDate(),
        today: dateKey === todayKey,
        hasTour: tourCount > 0,
        dots: Array.from({ length: Math.min(tourCount, 4) }, () => 'EN' as LangCode),
      };
    });
  }, [weekDays]);

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
        {days.map((d) => (
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
                    background: languageColors[dot] ?? '#6B8C75',
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
