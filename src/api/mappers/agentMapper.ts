import type { AgentRecord } from '@/api/types';
import type { Guide, GuideStatus } from '@/mocks/guides';

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function normalizeStatus(record: AgentRecord): GuideStatus {
  const raw = String(record.status ?? record.isVerified ?? '').toLowerCase();
  if (raw === 'true' || raw === 'verified' || raw === 'active' || raw === 'approved') {
    return 'active';
  }
  if (raw === 'pending' || raw === 'unverified' || raw === 'false') {
    return 'pending';
  }
  return 'inactive';
}

function parseLanguages(record: AgentRecord): Guide['languages'] {
  const langs = record.languagesYouSpeak ?? [];
  return langs
    .map((code) => code.slice(0, 2).toUpperCase())
    .filter(Boolean) as Guide['languages'];
}

export function mapAgentToGuide(record: AgentRecord, verified: boolean): Guide {
  const name =
    record.fullName ??
    (record as { name?: string }).name ??
    record.email ??
    'Unknown Guide';
  const id = String(record.id ?? record.userId ?? record.email ?? name);
  const status: GuideStatus = verified ? 'active' : normalizeStatus(record);

  return {
    id,
    name,
    email: record.email ?? '',
    initials: initialsFromName(name),
    languages: parseLanguages(record),
    status,
    certified: Boolean(record.tourGuideLicenseOrCertificationNo ?? record.certificateUpload),
    tours: Number((record as { tours?: number }).tours ?? 0),
    rating: null,
    license: record.tourGuideLicenseOrCertificationNo ?? '—',
    phone: record.phoneNumber ?? '—',
    activeSince: '—',
    earnings: { totalPaid: 0, pending: 0, totalTours: 0 },
    tourHistory: [],
    adminNote: verified ? '' : `Registered ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
  };
}

export function mapAgentsToGuides(records: AgentRecord[], verified: boolean): Guide[] {
  if (!Array.isArray(records)) return [];
  return records.map((record) => mapAgentToGuide(record, verified));
}
