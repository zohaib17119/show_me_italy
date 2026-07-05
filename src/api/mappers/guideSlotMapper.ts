import type { GuideSlotRecord } from '@/api/types';
import type { LangCode } from '@/types';

export interface GuideSlotRow {
  id: string;
  tourSlotId: number;
  tourName: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  entranceTime: string;
  guideName: string;
  totalPax: number;
  tickets: string;
  hasAssignedGuide: boolean;
  hasTicket: boolean;
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

function formatTime(value?: string): string {
  return value?.trim() ? value : '—';
}

function formatTimeRange(start?: string, end?: string): string {
  const s = start?.trim();
  const e = end?.trim();
  if (s && e) return `${s} - ${e}`;
  if (s) return s;
  if (e) return e;
  return '—';
}

function resolveGuideDisplayName(record: GuideSlotRecord): string {
  const name = record.fullName?.trim() || record.guideName?.trim();
  return name ? name : '—';
}

export function mapGuideSlot(record: GuideSlotRecord, index: number): GuideSlotRow {
  const tourSlotId = Number(record.tourSlotID ?? index);
  const lang = (record.code?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;
  const guidesNeeded = record.guidesNeeded ?? 0;
  const totalApplicants = record.totalApplicants ?? 0;
  const guideName = resolveGuideDisplayName(record);
  const tickets = String(record.tickets ?? '').trim();
  const startTime = formatTime(record.startTime);
  const endTime = formatTime(record.endTime);

  return {
    id: String(tourSlotId),
    tourSlotId,
    tourName: record.typeName ?? '—',
    dateLabel: formatSlotDate(record.slotDate),
    startTime,
    endTime,
    timeRange: formatTimeRange(record.startTime, record.endTime),
    entranceTime: formatTime(record.entranceTime),
    guideName,
    totalPax: Number(record.totalPAX) || 0,
    tickets,
    hasAssignedGuide: guideName !== '—',
    hasTicket: tickets.length > 0,
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
