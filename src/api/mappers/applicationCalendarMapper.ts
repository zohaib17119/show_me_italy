import type { ApplicationCalendarDayRecord } from '@/api/types';

export interface ApplicationCalendarDaySummary {
  dateKey: string;
  applicationCount: number;
}

function toDateKey(slotDate?: string): string | null {
  if (!slotDate?.trim()) return null;
  const trimmed = slotDate.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function indexApplicationCalendarByDate(
  records: ApplicationCalendarDayRecord[],
): Record<string, ApplicationCalendarDaySummary> {
  const byDate: Record<string, ApplicationCalendarDaySummary> = {};

  for (const record of records) {
    const dateKey = toDateKey(record.slotDate);
    if (!dateKey) continue;

    const existing = byDate[dateKey];
    if (existing) {
      existing.applicationCount += record.pendingCount ?? record.applicationCount ?? 0;
      continue;
    }

    byDate[dateKey] = {
      dateKey,
      applicationCount: record.pendingCount ?? record.applicationCount ?? 0,
    };
  }

  return byDate;
}
