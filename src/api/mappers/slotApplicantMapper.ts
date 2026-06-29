import type { SlotApplicantRecord } from '@/api/types';
import type { LangCode, TourStatus } from '@/types';

export interface SlotApplicantRow {
  id: string;
  guideId: string;
  applicationId: number | null;
  guideName: string;
  guideInitials: string;
  email: string;
  phoneNumber: string;
  languages: LangCode[];
  languagesLabel: string;
  status: TourStatus;
  statusRaw: string;
  appliedAt: string;
  tourSlotId: number;
}

function mapStatus(status?: string): TourStatus {
  const raw = (status ?? 'pending').toLowerCase();
  if (raw.includes('approve')) return 'approved';
  if (raw.includes('reject')) return 'rejected';
  if (raw.includes('den') || raw.includes('close')) return 'denied';
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

function parseLanguageCodes(codes?: string): LangCode[] {
  if (!codes) return ['EN'];
  return codes
    .split(',')
    .map((c) => c.trim().slice(0, 2).toUpperCase())
    .filter(Boolean) as LangCode[];
}

export function mapSlotApplicant(record: SlotApplicantRecord, index: number): SlotApplicantRow {
  const guideId = String(record.id ?? index);
  const applicationIdRaw = record.applicationID ?? record.applicationId;
  const applicationId =
    applicationIdRaw != null && !Number.isNaN(Number(applicationIdRaw))
      ? Number(applicationIdRaw)
      : null;
  const guideName = record.fullName ?? 'Unknown';

  return {
    id: guideId,
    guideId,
    applicationId,
    guideName,
    guideInitials: initials(guideName),
    email: record.email ?? '—',
    phoneNumber: record.phoneNumber ?? '—',
    languages: parseLanguageCodes(record.languagesYouSpeakCode),
    languagesLabel: record.languagesYouSpeak ?? '—',
    status: mapStatus(record.status),
    statusRaw: record.status ?? 'Pending',
    appliedAt: formatAppliedAt(record.appliedAt),
    tourSlotId: Number(record.tourSlotID ?? 0),
  };
}

export function mapSlotApplicants(records: SlotApplicantRecord[]): SlotApplicantRow[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapSlotApplicant);
}
