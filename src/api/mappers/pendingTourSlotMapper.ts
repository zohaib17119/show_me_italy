import type { PendingTourSlotRecord } from '@/api/types';
import type { LangCode, TourStatus } from '@/types';

export interface PendingTourSlotRow {
  id: string;
  tourSlotId: number;
  tourTypeName: string;
  tourCode: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  languageCode: LangCode | string;
  languageLabel: string;
  guidesLabel: string;
  guestCount: number;
  payRate: string;
  payRatePerHour: number | null;
  status: TourStatus;
  statusRaw: string;
  meetingPoint: string;
  applicantNames: string[];
  slotDateKey: string;
  slotDateIso: string;
}

function formatTimeRange(startTime?: string, endTime?: string): string {
  const start = startTime?.trim().slice(0, 5) ?? '';
  const end = endTime?.trim().slice(0, 5) ?? '';
  if (start && end) return `${start}–${end}`;
  if (start) return start;
  return '—';
}

function formatPayRate(value?: number): string {
  if (value == null) return '—';
  return `€${value}`;
}

function mapStatus(status?: string | null): TourStatus {
  const raw = (status ?? 'pending').toLowerCase();
  if (raw.includes('open')) return 'open';
  if (raw.includes('close')) return 'closed';
  if (raw.includes('confirm')) return 'confirmed';
  if (raw.includes('approve')) return 'approved';
  if (raw.includes('den') || raw.includes('reject')) return 'denied';
  if (raw.includes('unfill')) return 'unfilled';
  if (raw.includes('complete')) return 'completed';
  return 'pending';
}

function firstName(fullName?: string): string {
  const trimmed = fullName?.trim() ?? '';
  if (!trimmed) return 'Guide';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function resolveTourTypeName(record: PendingTourSlotRecord): string {
  const fromRecord =
    record.tourTypeName?.trim() ||
    record.typeName?.trim() ||
    '';
  if (fromRecord) return fromRecord;
  if (record.tourTypeId != null) return `Tour #${record.tourTypeId}`;
  return '—';
}

function resolveLanguageCode(record: PendingTourSlotRecord): string {
  const raw =
    record.languageCode?.trim() ||
    record.code?.trim() ||
    '';
  if (!raw) return '—';
  return raw.slice(0, 2).toUpperCase();
}

function resolveTourCode(record: PendingTourSlotRecord): string {
  return record.tourCode?.trim() || record.tourcode?.trim() || '—';
}

export function mapPendingTourSlot(
  record: PendingTourSlotRecord,
  index: number,
): PendingTourSlotRow {
  const apps = Array.isArray(record.guideApplicationResponse)
    ? record.guideApplicationResponse
    : [];
  const tourSlotId = Number(record.tourSlotId ?? index);
  const languageCode = resolveLanguageCode(record);
  const filled = record.guidesFilled ?? 0;
  const needed = record.guidesNeeded ?? 0;

  const startTime = record.startTime?.trim().slice(0, 5) ?? '';
  const endTime = record.endTime?.trim().slice(0, 5) ?? '';
  const slotDateIso = record.slotDate?.trim() ?? '';

  return {
    id: String(tourSlotId),
    tourSlotId,
    tourTypeName: resolveTourTypeName(record),
    tourCode: resolveTourCode(record),
    timeRange: formatTimeRange(record.startTime, record.endTime),
    startTime,
    endTime,
    languageCode,
    languageLabel: record.languageName?.trim() || languageCode,
    guidesLabel: `${filled} / ${needed}`,
    guestCount: record.guestCount ?? 0,
    payRate: formatPayRate(record.payRatePerHour),
    payRatePerHour: record.payRatePerHour ?? null,
    status: mapStatus(record.status),
    statusRaw: record.status ?? 'Open',
    meetingPoint: record.meetingPoint?.trim() || '—',
    applicantNames: apps.map((a) => firstName(a.fullName)),
    slotDateKey: slotDateIso.slice(0, 10),
    slotDateIso,
  };
}

export function mapPendingTourSlots(
  records: PendingTourSlotRecord[] | undefined,
): PendingTourSlotRow[] {
  if (!Array.isArray(records)) return [];
  return records
    .map(mapPendingTourSlot)
    .filter((row) => row.status === 'open');
}
