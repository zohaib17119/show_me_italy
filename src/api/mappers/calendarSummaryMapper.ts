import type { CalendarDaySummaryRecord } from '@/api/types';

export interface CalendarDaySummary {
  dateKey: string;
  totalTours: number;
  amTours: number;
  pmTours: number;
  assignedGuides: number;
  missingSlots: number;
  tourStartTime?: string;
  tourEndTime?: string;
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

export function indexSummariesByDate(
  records: CalendarDaySummaryRecord[],
): Record<string, CalendarDaySummary> {
  const byDate: Record<string, CalendarDaySummary> = {};

  for (const record of records) {
    const dateKey = toDateKey(record.slotDate);
    if (!dateKey) continue;

    const existing = byDate[dateKey];
    if (existing) {
      existing.totalTours += record.totalTours ?? 0;
      existing.amTours += record.amTours ?? 0;
      existing.pmTours += record.pmTours ?? 0;
      existing.assignedGuides += record.assignedGuides ?? 0;
      existing.missingSlots += record.missingSlots ?? 0;
      continue;
    }

    byDate[dateKey] = {
      dateKey,
      totalTours: record.totalTours ?? 0,
      amTours: record.amTours ?? 0,
      pmTours: record.pmTours ?? 0,
      assignedGuides: record.assignedGuides ?? 0,
      missingSlots: record.missingSlots ?? 0,
      tourStartTime: record.tourStartTime,
      tourEndTime: record.tourEndTime,
    };
  }

  return byDate;
}
