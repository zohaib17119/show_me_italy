import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';
import styles from './LangChip.module.css';

interface LangChipProps {
  code: LangCode | string;
  size?: 'sm' | 'md';
}

export function LangChip({ code, size = 'sm' }: LangChipProps) {
  const upper = code.toUpperCase();
  const color = languageColors[upper] ?? undefined;

  return (
    <span
      className={[styles.chip, styles[size], !color ? styles.fallback : ''].filter(Boolean).join(' ')}
      style={color ? { background: color } : undefined}
    >
      {upper}
    </span>
  );
}
