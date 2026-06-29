import type { AvailableGuideRecord } from '@/api/types';
import type { LangCode } from '@/types';

export interface AvailableGuideRow {
  id: string;
  guideId: string;
  name: string;
  initials: string;
  email: string;
  phoneNumber: string;
  languages: LangCode[];
  languagesLabel: string;
  license: string;
  isActive: boolean;
}

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

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function languageTokenToCode(token: string): LangCode | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (trimmed.length <= 3 && /^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed.slice(0, 2).toUpperCase() as LangCode;
  }
  return LANGUAGE_NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
}

function parseLanguageCodes(record: AvailableGuideRecord): LangCode[] {
  const codesRaw = record.languagesYouSpeakCode?.trim();
  if (codesRaw) {
    const fromCodes = codesRaw
      .split(/[,;|/]+/)
      .map(languageTokenToCode)
      .filter((code): code is LangCode => Boolean(code));
    if (fromCodes.length > 0) return fromCodes;
  }

  const speakRaw = record.languagesYouSpeak?.trim();
  if (!speakRaw) return [];

  return speakRaw
    .split(/[,;|/]+/)
    .map(languageTokenToCode)
    .filter((code): code is LangCode => Boolean(code));
}

export function mapAvailableGuide(record: AvailableGuideRecord, index: number): AvailableGuideRow {
  const guideId = String(record.id ?? index);
  const name = record.fullName ?? 'Unknown Guide';

  return {
    id: guideId,
    guideId,
    name,
    initials: initials(name),
    email: record.email ?? '—',
    phoneNumber: record.phoneNumber ?? '—',
    languages: parseLanguageCodes(record),
    languagesLabel: record.languagesYouSpeak ?? '—',
    license: record.tourGuideLicenseOrCertificationNo ?? '—',
    isActive: record.isActive === true,
  };
}

export function mapAvailableGuides(records: AvailableGuideRecord[]): AvailableGuideRow[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapAvailableGuide);
}
