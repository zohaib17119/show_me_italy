import { Spin } from 'antd';
import { AppButton } from '@/components/ui/buttons/AppButton';

export interface ListErrorStateProps {
  message?: string | null;
  loading?: boolean;
  onRetry: () => void;
}

export function ListErrorState({ message, loading = false, onRetry }: ListErrorStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '32px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360 }}>
        {message?.trim() || 'Something went wrong. Please try again.'}
      </div>
      <AppButton variant="secondary" size="xs" onClick={onRetry} disabled={loading}>
        {loading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Spin size="small" /> Retrying…
          </span>
        ) : (
          'Retry'
        )}
      </AppButton>
    </div>
  );
}
