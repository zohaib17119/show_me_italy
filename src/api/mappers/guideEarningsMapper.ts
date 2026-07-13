import type { GuideEarningsRecord } from '@/api/types/guideEarnings';

export interface GuideEarningsRow {
  id: string;
  guideId: string;
  guideName: string;
  guideInitials: string;
  email: string;
  phoneNumber: string;
  totalTours: number;
  totalEarnings: number;
  averagePayRate: number;
  minimumPayRate: number;
  maximumPayRate: number;
  firstTourDateLabel: string;
  lastTourDateLabel: string;
  languagesWorked: number;
  tourTypesWorked: number;
  totalHours: number;
  averageHourlyEarning: number;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDateLabel(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso.slice(0, 10));
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function mapGuideEarningsRecord(
  record: GuideEarningsRecord,
  index: number,
): GuideEarningsRow {
  const guideId = String(record.guideID ?? index);
  const guideName =
    record.guideName?.trim() ||
    [record.firstName, record.lastName].filter(Boolean).join(' ').trim() ||
    'Unknown';

  return {
    id: guideId,
    guideId,
    guideName,
    guideInitials: initials(guideName) || '?',
    email: record.email?.trim() || '—',
    phoneNumber: record.phoneNumber?.trim() || '—',
    totalTours: record.totalTours ?? 0,
    totalEarnings: record.totalEarnings ?? 0,
    averagePayRate: record.averagePayRate ?? 0,
    minimumPayRate: record.minimumPayRate ?? 0,
    maximumPayRate: record.maximumPayRate ?? 0,
    firstTourDateLabel: formatDateLabel(record.firstTourDate),
    lastTourDateLabel: formatDateLabel(record.lastTourDate),
    languagesWorked: record.languagesWorked ?? 0,
    tourTypesWorked: record.tourTypesWorked ?? 0,
    totalHours: record.totalHours ?? 0,
    averageHourlyEarning: record.averageHourlyEarning ?? 0,
  };
}

export function mapGuideEarningsRecords(
  records: GuideEarningsRecord[] | undefined,
): GuideEarningsRow[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapGuideEarningsRecord);
}
