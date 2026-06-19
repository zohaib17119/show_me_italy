import { useEffect } from 'react';
import { Card } from 'antd';
import { languageColors } from '@/theme/tokens';

const distribution = [
  { lang: 'English', code: 'EN', pct: 36 },
  { lang: 'Italian', code: 'IT', pct: 20 },
  { lang: 'French', code: 'FR', pct: 14 },
  { lang: 'Spanish', code: 'ES', pct: 10 },
  { lang: 'German', code: 'DE', pct: 9 },
  { lang: 'Others', code: 'PT', pct: 11 },
];

export function LanguageDistribution() {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-dist-bar]').forEach((bar) => {
      const w = bar.dataset.distBar;
      requestAnimationFrame(() => {
        bar.style.width = `${w}%`;
      });
    });
  }, []);

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
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>This week</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 14px' }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `conic-gradient(
              ${languageColors.EN} 0% 36%,
              ${languageColors.IT} 36% 56%,
              ${languageColors.FR} 56% 70%,
              ${languageColors.ES} 70% 80%,
              ${languageColors.DE} 80% 89%,
              ${languageColors.PT} 89% 100%
            )`,
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
            <span style={{ fontWeight: 800, fontSize: 12 }}>34</span>
            <span style={{ fontSize: 7, color: 'var(--text-muted)' }}>tours</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {distribution.map((d) => {
          const color = languageColors[d.code] ?? '#6B8C75';
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
