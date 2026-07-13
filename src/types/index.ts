export type LangCode = 'EN' | 'IT' | 'FR' | 'ES' | 'DE' | 'PT' | 'JA' | 'ZH';

export type TourStatus =
  | 'confirmed'
  | 'pending'
  | 'unfilled'
  | 'denied'
  | 'completed'
  | 'approved'
  | 'active'
  | 'inactive'
  | 'rejected'
  | 'hold'
  | 'open'
  | 'closed'

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

export type BadgeKey =
  | 'guides'
  | 'approvals'
  | 'applications'
  | 'payouts'
  | 'notifications';

export interface NavItemConfig {
  key: string;
  label: string;
  path: string;
  badgeKey?: BadgeKey;
  badgeColor?: 'green' | 'red' | 'orange';
}

export interface NavGroupConfig {
  label: string;
  items: NavItemConfig[];
}

export interface RouteMeta {
  title: string;
  subtitle?: string;
  breadcrumb: string;
}
