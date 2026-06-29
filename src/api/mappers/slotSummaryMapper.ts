import type { SlotSummaryRecord } from '@/api/types';
import type { TourStatus } from '@/types';

export interface SlotSummaryRow {
  tourName: string;
  dateLabel: string;
  languageLabel: string;
  filledLabel: string;
  payRateLabel: string;
  statusRaw: string;
  status: TourStatus;
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

function formatPayRate(value?: number): string {
  if (value == null) return '—';
  return `€${value.toFixed(2)}`;
}

function mapSlotStatus(status?: string): TourStatus {
  const raw = (status ?? 'pending').toLowerCase();
  if (raw.includes('open') || raw.includes('confirm')) return 'confirmed';
  if (raw.includes('approve')) return 'approved';
  if (raw.includes('close') || raw.includes('den') || raw.includes('reject')) return 'denied';
  if (raw.includes('unfill')) return 'unfilled';
  if (raw.includes('complete')) return 'completed';
  return 'pending';
}

export function mapSlotSummary(record?: SlotSummaryRecord | null): SlotSummaryRow | null {
  if (!record) return null;

  const guidesFilled = record.guidesFilled ?? 0;
  const guidesNeeded = record.guidesNeeded ?? 0;

  return {
    tourName: record.tour ?? '—',
    dateLabel: formatSlotDate(record.date),
    languageLabel: record.language ?? '—',
    filledLabel: `${guidesFilled} / ${guidesNeeded}`,
    payRateLabel: formatPayRate(record.payRate),
    statusRaw: record.status ?? '—',
    status: mapSlotStatus(record.status),
  };
}
