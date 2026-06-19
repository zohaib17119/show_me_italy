import { useEffect, useState } from 'react';
import { Card } from 'antd';
import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  sub?: string;
  trend?: ReactNode;
  accentColor?: string;
  valueColor?: string;
  alert?: boolean;
  warn?: boolean;
  onClick?: () => void;
}

export function StatCard({
  icon,
  value,
  label,
  sub,
  trend,
  accentColor = '#27AE60',
  valueColor,
  alert,
  warn,
  onClick,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      styles={{ body: { padding: '14px 15px' } }}
      style={{
        borderRadius: 12,
        cursor: onClick ? 'pointer' : 'default',
        borderColor: alert ? '#f5c6c2' : warn ? '#f6d860' : undefined,
        background: alert
          ? 'linear-gradient(135deg, white, #fff9f9)'
          : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: alert ? '#E74C3C' : warn ? '#F59E0B' : accentColor,
          borderRadius: '0 0 12px 12px',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        {trend}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: '-0.04em',
          color: valueColor ?? 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {displayValue.toLocaleString()}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, fontWeight: 500 }}>
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 10,
            color: alert ? '#E74C3C' : 'var(--text-muted)',
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      )}
    </Card>
  );
}
