import { useEffect, useMemo } from 'react';
import { Card } from 'antd';
import { useAppSelector } from '@/app/hooks';
import { selectCalendarEvents } from '@/features/tour/tourSlice';
import { selectLanguages } from '@/features/language/languageSlice';
import { languageColors } from '@/theme/tokens';

export function LanguageDistribution() {
  const events = useAppSelector(selectCalendarEvents);
  const languages = useAppSelector(selectLanguages);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.language] = (counts[e.language] ?? 0) + 1;
    });
    const total = events.length || 1;
    return Object.entries(counts)
      .map(([code, count]) => {
        const lang = languages.find((l) => l.code?.startsWith(code));
        return {
          lang: lang?.name ?? code,
          code,
          pct: Math.round((count / total) * 100),
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
  }, [events, languages]);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-dist-bar]').forEach((bar) => {
      const w = bar.dataset.distBar;
      requestAnimationFrame(() => {
        bar.style.width = `${w}%`;
      });
    });
  }, [distribution]);

  return (
    <Card id="distCard" styles={{ body: { padding: 16 } }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
          Language Distribution
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>All slots</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 14px' }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: '#eef4ef',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 12 }}>{events.length}</span>
            <span style={{ fontSize: 7, color: 'var(--text-muted)' }}>tours</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {distribution.map((d) => {
          const color = languageColors[d.code as keyof typeof languageColors] ?? '#6B8C75';
          return (
            <div
              key={d.lang}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 6px',
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  width: 60,
                  flexShrink: 0,
                }}
              >
                {d.lang}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 4,
                  background: '#eef4ef',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  data-dist-bar={d.pct}
                  style={{
                    height: '100%',
                    width: 0,
                    background: color,
                    borderRadius: 2,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  width: 28,
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                {d.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
