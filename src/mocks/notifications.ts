import type { LangCode } from '@/types';

export type NotificationType =
  | 'application'
  | 'registration'
  | 'payout'
  | 'schedule'
  | 'alert';

export interface NotificationInboxItem {
  id: string;
  type: NotificationType;
  icon: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export interface AnnouncementRecipientOption {
  id: string;
  label: string;
  count?: number;
  language?: LangCode;
  selected?: boolean;
}

export const MOCK_INBOX_ITEMS: NotificationInboxItem[] = [
  {
    id: 'notif-001',
    type: 'application',
    icon: '✅',
    iconBg: 'var(--g50)',
    title: 'Marco Rossi applied — Fri 17 Apr EN',
    body: 'Colosseum Arena · 10:00–12:30',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 'notif-002',
    type: 'registration',
    icon: '👤',
    iconBg: 'var(--blue-bg)',
    title: 'New guide: Yuki Tanaka registered',
    body: 'JA · EN · Pending approval',
    time: '18 min ago',
    unread: true,
  },
  {
    id: 'notif-003',
    type: 'payout',
    icon: '💰',
    iconBg: 'var(--orange-bg)',
    title: 'Sofia Conti submitted March payout',
    body: '€640.00 · Pending review',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 'notif-004',
    type: 'alert',
    icon: '⚠️',
    iconBg: 'var(--red-bg)',
    title: '24h Warning: ES slot unfilled',
    body: 'Colosseum Arena · tomorrow 14:30',
    time: '4 hours ago',
    unread: true,
  },
  {
    id: 'notif-005',
    type: 'schedule',
    icon: '📅',
    iconBg: 'var(--g50)',
    title: '4 tour slots created via Bulk',
    body: 'Week of Apr 21 · EN IT FR DE',
    time: '3 hours ago',
    unread: false,
  },
];

export const ANNOUNCEMENT_RECIPIENT_OPTIONS: AnnouncementRecipientOption[] = [
  { id: 'all', label: 'All Guides', count: 48, selected: true },
  { id: 'en', label: 'English', language: 'EN' },
  { id: 'it', label: 'Italian', language: 'IT' },
  { id: 'fr', label: 'French', language: 'FR' },
  { id: 'es', label: 'Spanish', language: 'ES' },
];

export const ANNOUNCEMENT_TYPES = [
  { value: 'announcement', label: '📢 Announcement' },
  { value: 'tour-update', label: '🗓️ Tour Update' },
  { value: 'payment-update', label: '💰 Payment Update' },
  { value: 'urgent', label: '⚠ Urgent Alert' },
] as const;
