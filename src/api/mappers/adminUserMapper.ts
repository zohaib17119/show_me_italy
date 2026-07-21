import { toTourTypeImagePreview } from '@/api/utils/fileToBase64';
import type { AdminUserRecord } from '@/api/types/adminUser';

export function formatCell(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function formatBool(value: unknown): string {
  if (value == null) return '—';
  return value ? 'Yes' : 'No';
}

export function formatArray(value: unknown): string {
  if (value == null) return '—';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.map((item) => formatCell(item)).join(', ');
  }
  return formatCell(value);
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function resolveProfilePicturePreview(source: string | null | undefined): string | undefined {
  const trimmed = source?.trim();
  if (!trimmed) return undefined;
  return toTourTypeImagePreview(trimmed, 0).previewUrl;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  initials: string;
  profilePicture?: string;
  country: string;
  city: string;
  roleName: string;
  roleId: string;
  isActive: boolean;
  isActiveLabel: string;
  isVerifiedLabel: string;
  isAuthenticatedLabel: string;
  isDeleteLabel: string;
  tourGuideLicenseOrCertificationNo: string;
  languagesYouSpeak: string;
  languagesYouSpeakCode: string;
  certificateUpload: string;
  message: string;
  adminNotes: string;
  cancellationPercentage: string;
  totalTour: string;
  totalEarning: string;
  rating: string;
  pendingCounts: string;
  userlanguages: string;
  favorite: string;
}

export function mapAdminUserRecord(record: AdminUserRecord, index: number): AdminUserRow {
  const name = record.fullName?.trim() || 'Unknown';
  return {
    id: String(record.id ?? index),
    name,
    email: formatCell(record.email),
    phoneNumber: formatCell(record.phoneNumber),
    initials: initialsFromName(name) || '?',
    profilePicture: resolveProfilePicturePreview(record.profilePicture),
    country: formatCell(record.country),
    city: formatCell(record.city),
    roleName: formatCell(record.roleName),
    roleId: formatCell(record.roleId),
    isActive: Boolean(record.isActive),
    isActiveLabel: formatBool(record.isActive),
    isVerifiedLabel: formatBool(record.isVerified),
    isAuthenticatedLabel: formatBool(record.isAuthenticated),
    isDeleteLabel: formatBool(record.isDelete),
    tourGuideLicenseOrCertificationNo: formatCell(record.tourGuideLicenseOrCertificationNo),
    languagesYouSpeak: formatCell(record.languagesYouSpeak),
    languagesYouSpeakCode: formatCell(record.languagesYouSpeakCode),
    certificateUpload: formatCell(record.certificateUpload),
    message: formatCell(record.message),
    adminNotes: formatCell(record.adminNotes),
    cancellationPercentage: formatCell(record.cancellationPercentage),
    totalTour: formatCell(record.totalTour),
    totalEarning: formatCell(record.totalEarning),
    rating: formatCell(record.rating),
    pendingCounts: formatCell(record.pendingCounts),
    userlanguages: formatArray(record.userlanguages),
    favorite: formatCell(record.favorite),
  };
}

export function mapAdminUserRecords(records: AdminUserRecord[] | undefined): AdminUserRow[] {
  if (!Array.isArray(records)) return [];
  return records.map(mapAdminUserRecord);
}
