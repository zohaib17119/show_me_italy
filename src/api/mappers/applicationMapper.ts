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

export function mapApplication(record: AgentApplication, index: number): Application {
  const guideName =
    record.guideName ??
    (record as { agentName?: string }).agentName ??
    (record as { fullName?: string }).fullName ??
    'Unknown';
  const lang = (record.language?.slice(0, 2).toUpperCase() ?? 'EN') as LangCode;

  return {
    id: String(record.id ?? index),
    guideId: String(record.agentId ?? record.guideId ?? index),
    guideName,
    guideInitials: initials(guideName),
    tour: record.tour ?? `Tour #${record.tourSlotId ?? '—'}`,
    date: record.dateLabel ?? '—',
    dateLabel: record.dateLabel ?? '—',
    time: record.time ?? '—',
    language: lang,
    appliedAt: record.appliedAt ?? '—',
    status: mapStatus(record.status),
  };
}

export function mapApplications(records: AgentApplication[]): Application[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapApplication);
}
