import { useEffect, useState } from 'react';
import { Card } from 'antd';
import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

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
  accentColor,
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

  const cardClass = [
    styles.card,
    alert ? styles.alert : '',
    warn ? styles.warn : '',
  ]
    .filter(Boolean)
    .join(' ');

  const accentStyle = accentColor ? { background: accentColor } : undefined;

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      styles={{ body: { padding: '14px 15px' } }}
      className={cardClass}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        className={[
          styles.accent,
          alert ? styles.accentAlert : '',
          warn ? styles.accentWarn : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={!alert && !warn ? accentStyle : undefined}
      />
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        {trend}
      </div>
      <div
        className={styles.value}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {displayValue.toLocaleString()}
      </div>
      <div className={styles.label}>{label}</div>
      {sub && (
        <div className={[styles.sub, alert ? styles.subAlert : ''].filter(Boolean).join(' ')}>
          {sub}
        </div>
      )}
    </Card>
  );
}
