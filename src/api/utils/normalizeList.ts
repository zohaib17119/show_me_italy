import { unwrapData } from '@/api/types';

const LIST_KEYS = ['records', 'agents', 'items', 'result', 'list', 'data'];

function arrayFromObject(obj: Record<string, unknown>): unknown[] | null {
  for (const key of LIST_KEYS) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
  }
  return null;
}

export function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  const unwrapped = unwrapData<unknown>(payload);
  if (Array.isArray(unwrapped)) return unwrapped as T[];

  if (unwrapped && typeof unwrapped === 'object') {
    const fromObject = arrayFromObject(unwrapped as Record<string, unknown>);
    if (fromObject) return fromObject as T[];
    return [unwrapped as T];
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data: unknown }).data;
    if (Array.isArray(nested)) return nested as T[];
    if (nested && typeof nested === 'object') {
      const fromNested = arrayFromObject(nested as Record<string, unknown>);
      if (fromNested) return fromNested as T[];
    }
  }

  return [];
}
