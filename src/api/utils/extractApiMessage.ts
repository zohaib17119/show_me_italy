const FALLBACK_ERROR_MESSAGE = 'Something went wrong';

function readMessage(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function extractApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const obj = payload as Record<string, unknown>;

  const direct =
    readMessage(obj.message) ??
    readMessage(obj.Message) ??
    readMessage(obj.error) ??
    readMessage(obj.Error);
  if (direct) return direct;

  if (obj.data && typeof obj.data === 'object') {
    const nested = obj.data as Record<string, unknown>;
    const nestedMessage =
      readMessage(nested.message) ??
      readMessage(nested.Message) ??
      readMessage(nested.error);
    if (nestedMessage) return nestedMessage;
  }

  if (Array.isArray(obj.errors) && obj.errors.length > 0) {
    const first = obj.errors[0];
    if (typeof first === 'string') return readMessage(first);
    if (first && typeof first === 'object') {
      const errObj = first as Record<string, unknown>;
      return readMessage(errObj.message) ?? readMessage(errObj.description);
    }
  }

  return null;
}

export { FALLBACK_ERROR_MESSAGE };
