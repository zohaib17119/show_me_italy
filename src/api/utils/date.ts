export function toApiDateTime(dateYmd: string): string {
  return `${dateYmd}T00:00:00`;
}

export function endOfDayApiDateTime(dateYmd: string): string {
  return `${dateYmd}T23:59:59`;
}

export function formatLocalDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function todayLocalDateKey(): string {
  const now = new Date();
  return formatLocalDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDaysToDateKey(dateYmd: string, days: number): string {
  const [y, m, d] = dateYmd.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return formatLocalDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWeekRange(dateYmd: string): { start: string; end: string } {
  const [y, m, d] = dateYmd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayOfWeek = date.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addDaysToDateKey(dateYmd, mondayOffset);
  const sunday = addDaysToDateKey(monday, 6);
  return {
    start: toApiDateTime(monday),
    end: endOfDayApiDateTime(sunday),
  };
}

export function getDayRange(dateYmd: string): { start: string; end: string } {
  return {
    start: toApiDateTime(dateYmd),
    end: endOfDayApiDateTime(dateYmd),
  };
}

export function getMonthGridRange(
  gridDates: string[],
): { start: string; end: string } | null {
  if (gridDates.length === 0) return null;
  return {
    start: toApiDateTime(gridDates[0]),
    end: endOfDayApiDateTime(gridDates[gridDates.length - 1]),
  };
}

export function formatDisplayDate(dateYmd: string): string {
  const [y, m, d] = dateYmd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function parseApiDateTime(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/(\.\d{3})\d+/, '$1');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatNotificationTime(iso: string): string {
  const date = parseApiDateTime(iso);
  if (!date) return '—';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins >= 0 && diffMins < 1) return 'Just now';
  if (diffMins >= 1 && diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours >= 1 && diffHours < 24 && now.toDateString() === date.toDateString()) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getNotificationSortTime(iso: string): number {
  const date = parseApiDateTime(iso);
  return date?.getTime() ?? 0;
}
