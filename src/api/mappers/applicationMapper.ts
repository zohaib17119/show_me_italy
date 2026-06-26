import type { AgentApplication } from '@/api/types';
import type { Application } from '@/mocks/applications';
import type { LangCode, TourStatus } from '@/types';

function mapStatus(status?: string): TourStatus {
  const raw = (status ?? 'pending').toLowerCase();
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

export function mapApplication(record: AgentApplication, index: number): Application {
  const applicationId = Number(record.applicationId ?? record.id ?? index);
  const guideName =
    record.guideName ??
    (record as { agentName?: string }).agentName ??
    (record as { fullName?: string }).fullName ??
    'Unknown';
  const lang = (record.language?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;

  return {
    id: String(applicationId),
    applicationId,
    guideId: String(record.agentId ?? record.guideId ?? index),
    guideName,
    guideInitials: initials(guideName),
    tour: record.tour ?? `Tour #${record.tourSlotId ?? '—'}`,
    date: record.dateLabel ?? '—',
    dateLabel: record.dateLabel ?? '—',
    time: record.time ?? '—',
    language: lang,
    appliedAt: formatAppliedAt(record.appliedAt),
    status: mapStatus(record.status),
  };
}

export function mapApplications(records: AgentApplication[]): Application[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapApplication);
}
