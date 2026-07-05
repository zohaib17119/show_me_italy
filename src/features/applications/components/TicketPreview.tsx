import type { CSSProperties } from 'react';
import { resolveTicketPreviewKind } from '@/api/utils/fileToBase64';

interface TicketPreviewProps {
  src: string;
  minHeight?: number;
}

const frameStyle = (minHeight: number): CSSProperties => ({
  width: '100%',
  minHeight,
  border: '1px solid var(--border-color)',
  borderRadius: 8,
});

export function TicketPreview({ src, minHeight = 420 }: TicketPreviewProps) {
  const kind = resolveTicketPreviewKind(src);

  if (kind === 'image') {
    return (
      <div
        style={{
          ...frameStyle(minHeight),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--content-bg)',
          overflow: 'auto',
        }}
      >
        <img
          src={src}
          alt="Ticket preview"
          style={{
            maxWidth: '100%',
            maxHeight: minHeight,
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }

  return (
    <iframe src={src} title="Ticket preview" style={frameStyle(minHeight)} />
  );
}
