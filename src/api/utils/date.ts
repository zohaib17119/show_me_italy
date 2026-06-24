export function toApiDateTime(dateYmd: string): string {
  return `${dateYmd}T00:00:00`;
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
