import type { AgentApplication } from '@/api/types';
import type { Application } from '@/mocks/applications';
import type { LangCode, TourStatus } from '@/types';

function mapStatus(status?: string): TourStatus {
  const raw = (status ?? 'pending').toLowerCase();
  if (raw.includes('hold')) return 'hold';
  if (raw.includes('approve')) return 'approved';
  if (raw.includes('den') || raw.includes('reject')) return 'denied';
  if (raw.includes('complete')) return 'completed';
  return 'pending';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function formatAppliedAt(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function formatTimeRange(startTime?: string, endTime?: string, fallback?: string): string {
  if (startTime && endTime) return `${startTime}–${endTime}`;
  return fallback ?? '—';
}

function formatPayRate(value?: number): string {
  if (value == null) return '—';
  return `€${value}`;
}

export function mapApplication(record: AgentApplication, index: number): Application {
  const applicationId = Number(
    record.applicationID ?? record.applicationId ?? record.id ?? index,
  );
  const guideName =
    record.fullName ??
    record.guideName ??
    (record as { agentName?: string }).agentName ??
    'Unknown';
  const lang = (
    record.code?.slice(0, 2).toUpperCase() ??
    record.language?.slice(0, 2).toUpperCase() ??
    'EN'
  ) as LangCode;
  const slotDateKey = record.slotDate?.slice(0, 10) ?? '—';
  const tourSlotIdRaw = record.tourSlotID ?? record.tourSlotId;
  const tourSlotId =
    tourSlotIdRaw != null && !Number.isNaN(Number(tourSlotIdRaw))
      ? Number(tourSlotIdRaw)
      : null;

  return {
    id: String(applicationId),
    applicationId,
    guideId: String(record.agentId ?? record.guideId ?? index),
    guideName,
    guideInitials: initials(guideName),
    tourSlotId,
    tour: record.typeName ?? record.tour ?? '—',
    date: slotDateKey,
    dateLabel: record.dateLabel ?? formatSlotDate(record.slotDate),
    time: formatTimeRange(record.startTime, record.endTime, record.time),
    language: lang,
    payRate: formatPayRate(record.payRateSnapshot),
    adminNotes: record.adminNotes?.trim() ?? '',
    appliedAt: formatAppliedAt(record.appliedAt),
    status: mapStatus(record.status),
  };
}

export function mapApplications(records: AgentApplication[]): Application[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapApplication);
}
