import type { AnnouncementNotification } from '@/api/types';
import { formatNotificationTime, getNotificationSortTime } from '@/api/utils/date';
import { ANNOUNCEMENT_TYPES } from '@/mocks/notifications';

export interface AnnouncementInboxRow {
  id: string;
  title: string;
  message: string;
  meta: string;
  time: string;
  notificationType: string;
  icon: string;
  iconBg: string;
  unread: boolean;
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
