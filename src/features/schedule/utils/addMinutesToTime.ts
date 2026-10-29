export function addMinutesToTime(
  time: string,
  durationMinutes: number,
): string | null {
  const trimmed = time.trim();
  if (!trimmed || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return null;
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const total = (hours * 60 + minutes + Math.round(durationMinutes)) % (24 * 60);
  const normalized = total < 0 ? total + 24 * 60 : total;
  const endHours = Math.floor(normalized / 60);
  const endMinutes = normalized % 60;

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}
