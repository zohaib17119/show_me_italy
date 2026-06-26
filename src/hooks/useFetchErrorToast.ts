import { useEffect, useRef } from 'react';
import { showToast } from '@/components/ui';

export function useFetchErrorToast(
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null | undefined,
) {
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== 'failed' || !error) return;
    if (lastErrorRef.current === error) return;
    lastErrorRef.current = error;
    showToast(error);
  }, [status, error]);

  useEffect(() => {
    if (status === 'succeeded') {
      lastErrorRef.current = null;
    }
  }, [status]);
}
