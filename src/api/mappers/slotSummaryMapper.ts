import type { SlotSummaryRecord } from '@/api/types';
import type { LangCode, TourStatus } from '@/types';

export interface SlotSummaryRow {
  tourName: string;
  tourCode: string;
  dateKey: string;
  dateLabel: string;
  languageId: number | null;
  tourTypeId: number | null;
  languageCode: LangCode | string;
  languageLabel: string;
  filledLabel: string;
  payRateLabel: string;
  payRateValue: number | null;
  startTime: string;
  endTime: string;
  timeRange: string;
  guestCount: number | null;
  statusRaw: string;
  status: TourStatus;
}

function formatSlotDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso.slice(0, 10));
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatPayRate(value?: number | null): string {
  if (value == null) return '—';
  return `€${value.toFixed(2)}`;
}

function formatTime(value?: string | null): string {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed.slice(0, 5) : '';
}

function formatTimeRange(start?: string, end?: string): string {
  if (start && end) return `${start}–${end}`;
  if (start) return start;
  if (end) return end;
  return '—';
}

function mapSlotStatus(status?: string | null): TourStatus {
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

export function mapSlotSummary(record?: SlotSummaryRecord | null): SlotSummaryRow | null {
  if (!record) return null;

  const guidesFilled = record.guidesFilled ?? 0;
  const guidesNeeded = record.guidesNeeded ?? 0;
  const slotDate = record.slotDate ?? record.date ?? '';
  const payRate = record.payRatePerHour ?? record.payRate ?? null;
  const languageCodeRaw =
    record.languageCode?.trim() ||
    (typeof record.language === 'string' ? record.language.trim() : '') ||
    '';
  const languageCode = languageCodeRaw
    ? languageCodeRaw.slice(0, 2).toUpperCase()
    : '—';
  const startTime = formatTime(record.startTime);
  const endTime = formatTime(record.endTime);

  return {
    tourName: record.tourTypeName?.trim() || record.tour?.trim() || '—',
    tourCode: record.tourCode?.trim() || '—',
    dateKey: slotDate.slice(0, 10),
    dateLabel: formatSlotDate(slotDate),
    languageId: record.languageID ?? null,
    tourTypeId: record.tourTypeId ?? null,
    languageCode,
    languageLabel: record.languageName?.trim() || languageCode,
    filledLabel: `${guidesFilled} / ${guidesNeeded}`,
    payRateLabel: formatPayRate(payRate),
    payRateValue: payRate,
    startTime,
    endTime,
    timeRange: formatTimeRange(startTime, endTime),
    guestCount: record.guestCount ?? null,
    statusRaw: record.status ?? '—',
    status: mapSlotStatus(record.status),
  };
}
