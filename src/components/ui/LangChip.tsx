import { languageColors } from '@/theme/tokens';
import type { LangCode } from '@/types';

interface LangChipProps {
  code: LangCode | string;
  size?: 'sm' | 'md';
}

export function LangChip({ code, size = 'sm' }: LangChipProps) {
  const upper = code.toUpperCase();
  const color = languageColors[upper] ?? '#6B8C75';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '3px 10px',
        borderRadius: 999,
        fontSize: size === 'sm' ? 10 : 11,
        fontWeight: 700,
        color: 'white',
        background: color,
        lineHeight: 1.4,
      }}
    >
      {upper}
    </span>
  );
}
