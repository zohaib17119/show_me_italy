import { Card } from 'antd';

export function RevenueCard() {
  return (
    <Card id="revenueCard" styles={{ body: { padding: '14px 16px' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            April Revenue
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
            }}
          >
            €12,800
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#e0f5e9',
              color: '#1e8449',
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            ▲ 23% vs March
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>YTD</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-secondary)' }}>
            €68,400
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 0 0' }}>
        <div
          style={{
            height: 52,
            background: 'linear-gradient(180deg, rgba(39,174,96,0.15) 0%, transparent 100%)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: 11,
          }}
        >
          Sparkline chart — Phase 2
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontSize: 9,
            color: 'var(--text-muted)',
          }}
        >
          {['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}
