import { useNavigate } from 'react-router-dom';
import { Button, Card } from 'antd';
import { ROUTES } from '@/constants/routes';
import { languageColors } from '@/theme/tokens';

const weekDays = [
  { label: 'M', num: 13, dots: ['EN', 'IT'] },
  { label: 'T', num: 14, today: true, dots: ['EN', 'IT', 'FR', 'RED'] },
  { label: 'W', num: 15, dots: [] },
  { label: 'T', num: 16, dots: [] },
  { label: 'F', num: 17, hasTour: true, dots: ['EN', 'DE'] },
  { label: 'S', num: 18, dots: [] },
  { label: 'S', num: 19, dots: [] },
];

export function WeekMini() {
  const navigate = useNavigate();

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
                      dot === 'RED'
                        ? '#E74C3C'
                        : (languageColors[dot] ?? '#6B8C75'),
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
