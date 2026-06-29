import type { GuideSlotRecord } from '@/api/types';
import type { LangCode } from '@/types';

export interface GuideSlotRow {
  id: string;
  tourSlotId: number;
  tourName: string;
  dateLabel: string;
  time: string;
  language: LangCode;
  guidesNeeded: number;
  totalApplicants: number;
  applicantsLabel: string;
}

function formatSlotDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso.slice(0, 10));
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTimeRange(startTime?: string, endTime?: string): string {
  if (startTime && endTime) return `${startTime}–${endTime}`;
  return '—';
}

export function mapGuideSlot(record: GuideSlotRecord, index: number): GuideSlotRow {
  const tourSlotId = Number(record.tourSlotID ?? index);
  const lang = (record.code?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;
  const guidesNeeded = record.guidesNeeded ?? 0;
  const totalApplicants = record.totalApplicants ?? 0;

  return {
    id: String(tourSlotId),
    tourSlotId,
    tourName: record.typeName ?? '—',
    dateLabel: formatSlotDate(record.slotDate),
    time: formatTimeRange(record.startTime, record.endTime),
    language: lang,
    guidesNeeded,
    totalApplicants,
    applicantsLabel: `${guidesNeeded}/${totalApplicants}`,
  };
}

export function mapGuideSlots(records: GuideSlotRecord[]): GuideSlotRow[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapGuideSlot);
}
