import type { AgentRecord, GuideApplicationRecord } from '@/api/types';
import type { Guide, GuideStatus } from '@/mocks/guides';
import type { LangCode, TourStatus } from '@/types';

const LANGUAGE_NAME_TO_CODE: Record<string, LangCode> = {
  english: 'EN',
  italian: 'IT',
  french: 'FR',
  spanish: 'ES',
  german: 'DE',
  japanese: 'JA',
  chinese: 'ZH',
  portuguese: 'PT',
};

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function normalizeStatus(record: AgentRecord, pending = false): GuideStatus {
  if (pending) return 'pending';
  const raw = String(record.status ?? record.isVerified ?? record.isActive ?? '').toLowerCase();
  if (raw === 'true' || raw === 'verified' || raw === 'active' || raw === 'approved') {
    return 'active';
  }
  if (raw === 'pending' || raw === 'unverified') {
    return 'pending';
  }
  if (raw === 'inactive' || raw === 'rejected' || raw === 'denied' || raw === 'false') {
    return 'inactive';
  }
  if (record.isActive === false) return 'inactive';
  if (record.isVerified === false) return 'pending';
  return 'active';
}

function languageTokenToCode(token: string): LangCode | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (trimmed.length <= 3 && /^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed.slice(0, 2).toUpperCase() as LangCode;
  }
  return LANGUAGE_NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
}

function parseLanguages(record: AgentRecord): Guide['languages'] {
  const raw =
    record.languagesYouSpeak ??
    (record as { languages?: string[] | string }).languages ??
    record.languagesYouSpeakCode ??
    [];

  if (typeof raw === 'string') {
    return raw
      .split(/[,;|/]+/)
      .map(languageTokenToCode)
      .filter((code): code is LangCode => Boolean(code));
  }

  if (Array.isArray(raw)) {
    return raw
      .map((entry) =>
        typeof entry === 'string' ? languageTokenToCode(entry) : languageTokenToCode(String(entry)),
      )
      .filter((code): code is LangCode => Boolean(code));
  }

  return [];
}

export function mapAgentToGuide(record: AgentRecord, options?: { pending?: boolean }): Guide {
  const pending = options?.pending ?? false;
  const name =
    record.fullName ??
    (record as { name?: string }).name ??
    record.email ??
    'Unknown Guide';
  const id = String(record.userId ?? record.id ?? record.email ?? name);
  const status = normalizeStatus(record, pending);

  return {
    id,
    name,
    email: record.email ?? '',
    initials: initialsFromName(name),
    languages: parseLanguages(record),
    status,
    certified: Boolean(record.tourGuideLicenseOrCertificationNo ?? record.certificateUpload),
    tours: Number((record as { tours?: number }).tours ?? (record as { totalTours?: number }).totalTours ?? 0),
    rating: (record as { rating?: number }).rating ?? null,
    license: record.tourGuideLicenseOrCertificationNo ?? '—',
    phone: record.phoneNumber ?? '—',
    activeSince: (record as { activeSince?: string }).activeSince ?? '—',
    earnings: { totalPaid: 0, pending: 0, totalTours: 0 },
    tourHistory: [],
    adminNote: pending
      ? `Registered ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : record.reasonOfRejection
        ? `Note: ${record.reasonOfRejection}`
        : '',
    certificateUpload: record.certificateUpload,
  };
}

export function mapAgentsToGuides(
  records: AgentRecord[],
  options?: { pending?: boolean },
): Guide[] {
  if (!Array.isArray(records)) return [];
  return records.map((record) => mapAgentToGuide(record, options));
}

export interface GuideApplicationRow {
  id: string;
  appliedAt: string;
  tourSlot: string;
  payRate: string;
  status: TourStatus;
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

function mapApplicationStatus(status?: string): TourStatus {
  const raw = (status ?? 'pending').toLowerCase();
  if (raw.includes('approve')) return 'approved';
  if (raw.includes('den') || raw.includes('reject')) return 'denied';
  if (raw.includes('complete')) return 'completed';
  if (raw.includes('confirm')) return 'confirmed';
  return 'pending';
}

export function mapGuideApplicationsToHistory(
  records: GuideApplicationRecord[] | undefined,
): GuideApplicationRow[] {
  if (!Array.isArray(records)) return [];
  return records.map((record, index) => ({
    id: String(record.applicationId ?? index),
    appliedAt: formatAppliedAt(record.appliedAt),
    tourSlot: `Tour #${record.tourSlotId ?? '—'}`,
    payRate: record.payRateSnapshot != null ? `€${record.payRateSnapshot}` : '—',
    status: mapApplicationStatus(record.status),
  }));
}
