import type { AnnouncementNotification, NotificationRecipientRecord } from '@/api/types';
import { formatNotificationTime, getNotificationSortTime } from '@/api/utils/date';
import { ANNOUNCEMENT_TYPES } from '@/mocks/notifications';

export interface AnnouncementInboxRow {
  id: string;
  recipientId?: number;
  title: string;
  message: string;
  meta: string;
  time: string;
  notificationType: string;
  icon: string;
  iconBg: string;
  unread: boolean;
  url?: string | null;
}

const TYPE_STYLES: Record<string, { icon: string; iconBg: string }> = {
  announcement: { icon: '📢', iconBg: 'var(--g50)' },
  'tour-update': { icon: '🗓️', iconBg: 'var(--blue-bg)' },
  'payment-update': { icon: '💰', iconBg: 'var(--orange-bg)' },
  urgent: { icon: '⚠', iconBg: 'var(--red-bg)' },
};

function formatChannels(channels: string): string {
  return channels
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
    .join(', ');
}

function typeLabel(notificationType: string): string {
  const match = ANNOUNCEMENT_TYPES.find((t) => t.value === notificationType);
  if (!match) return notificationType;
  return match.label.replace(/^[^\s]+\s/, '');
}

function buildMeta(dto: AnnouncementNotification): string {
  const parts: string[] = [];

  const type = typeLabel(dto.notificationType ?? '');
  if (type) parts.push(type);

  if (dto.audience?.trim()) parts.push(dto.audience.trim());

  const channels = formatChannels(dto.channels ?? '');
  if (channels) parts.push(channels);

  if (dto.createdBy?.trim()) parts.push(`by ${dto.createdBy.trim()}`);

  return parts.join(' · ');
}

function resolveTypeStyle(notificationType: string) {
  return TYPE_STYLES[notificationType] ?? { icon: '🔔', iconBg: 'var(--g50)' };
}

export function getNotificationTypeStyle(notificationType: string) {
  return resolveTypeStyle(notificationType);
}

export function getNotificationTypeLabel(notificationType: string): string {
  return typeLabel(notificationType);
}

export function mapAnnouncementToInboxRow(dto: AnnouncementNotification): AnnouncementInboxRow {
  const style = resolveTypeStyle(dto.notificationType ?? '');
  const timeSource = dto.sentAt?.trim() || dto.createdAt?.trim() || '';

  return {
    id: dto.id || crypto.randomUUID(),
    title: dto.title?.trim() || 'Notification',
    message: dto.message?.trim() ?? '',
    meta: buildMeta(dto),
    time: timeSource ? formatNotificationTime(timeSource) : '—',
    notificationType: dto.notificationType ?? '',
    icon: style.icon,
    iconBg: style.iconBg,
    unread: dto.isRead === false,
  };
}

export function mapAnnouncementsToInboxRows(
  items: AnnouncementNotification[],
): AnnouncementInboxRow[] {
  return [...items]
    .sort((a, b) => {
      const bTime = getNotificationSortTime(b.sentAt || b.createdAt);
      const aTime = getNotificationSortTime(a.sentAt || a.createdAt);
      return bTime - aTime;
    })
    .map(mapAnnouncementToInboxRow);
}

function buildRecipientMeta(record: NotificationRecipientRecord): string {
  const parts: string[] = [];
  const type = typeLabel(record.notificationType ?? '');
  if (type) parts.push(type);
  if (record.audience?.trim()) parts.push(record.audience.trim());
  const channels = formatChannels(record.channels ?? '');
  if (channels) parts.push(channels);
  return parts.join(' · ');
}

function resolveRecipientId(record: NotificationRecipientRecord): number | undefined {
  const raw = record as Record<string, unknown>;
  const candidates = [
    record.notificationRecipientId,
    raw.NotificationRecipientId,
    record.notificationId,
    raw.NotificationId,
    raw.id,
    raw.Id,
    raw.recipientId,
    raw.RecipientId,
  ];
  for (const value of candidates) {
    const num = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return undefined;
}

function resolveIsUnread(record: NotificationRecipientRecord): boolean {
  const raw = record as Record<string, unknown>;
  const readFlag = record.isRead ?? raw.IsRead ?? raw.read ?? raw.Read;
  if (readFlag === true || readFlag === 'true' || readFlag === 1 || readFlag === '1') {
    return false;
  }
  return true;
}

export function mapRecipientToInboxRow(record: NotificationRecipientRecord): AnnouncementInboxRow {
  const style = resolveTypeStyle(record.notificationType ?? '');
  const timeSource = record.readDate?.trim() || record.scheduledAt?.trim() || '';

  return {
    id: record.notificationId ?? crypto.randomUUID(),
    recipientId: resolveRecipientId(record),
    title: record.title?.trim() || 'Notification',
    message: record.message?.trim() ?? '',
    meta: buildRecipientMeta(record),
    time: timeSource ? formatNotificationTime(timeSource) : '—',
    notificationType: record.notificationType ?? '',
    icon: style.icon,
    iconBg: style.iconBg,
    unread: resolveIsUnread(record),
    url: record.url?.trim() || null,
  };
}

export function mapRecipientsToInboxRows(
  items: NotificationRecipientRecord[],
): AnnouncementInboxRow[] {
  return [...items]
    .sort((a, b) => {
      const bTime = getNotificationSortTime(b.readDate ?? b.scheduledAt ?? '');
      const aTime = getNotificationSortTime(a.readDate ?? a.scheduledAt ?? '');
      return bTime - aTime;
    })
    .map(mapRecipientToInboxRow);
}
