import type { NavGroupConfig, RouteMeta } from '@/types';
import { ROUTES } from './routes';

export const navigationGroups: NavGroupConfig[] = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', path: ROUTES.DASHBOARD },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { key: 'calendar', label: 'Calendar', path: ROUTES.CALENDAR },
      { key: 'create-tour', label: 'Create Tour Slot', path: ROUTES.CREATE_TOUR },
      { key: 'bulk', label: 'Bulk Creator', path: ROUTES.BULK },
      { key: 'import', label: 'Import / Sync', path: ROUTES.IMPORT },
    ],
  },
  {
    label: 'Guides',
    items: [
      {
        key: 'guides',
        label: 'Guide Roster',
        path: ROUTES.GUIDES,
        badgeKey: 'guides',
        badgeColor: 'green',
      },
      {
        key: 'approvals',
        label: 'New Approvals',
        path: ROUTES.APPROVALS,
        badgeKey: 'approvals',
        badgeColor: 'red',
      },
    ],
  },
  {
    label: 'Applications',
    items: [
      {
        key: 'applications',
        label: 'Applications Calendar',
        path: ROUTES.APPLICATIONS,
        badgeKey: 'applications',
        badgeColor: 'red',
      },
      { key: 'assignment', label: 'Slot Assignment', path: ROUTES.GUIDE_SLOTS },
    ],
  },
  {
    label: 'Payments',
    items: [
      {
        key: 'payouts',
        label: 'Payout Requests',
        path: ROUTES.PAYOUTS,
        badgeKey: 'payouts',
        badgeColor: 'orange',
      },
      { key: 'payout-detail', label: 'Payout Detail', path: '/payments/payouts/payout-marco-march' },
      { key: 'reports', label: 'Payment Reports', path: ROUTES.REPORTS },
    ],
  },
  {
    label: 'System',
    items: [
      {
        key: 'notifications',
        label: 'Notifications',
        path: ROUTES.NOTIFICATIONS,
        badgeKey: 'notifications',
        badgeColor: 'red',
      },
      { key: 'settings', label: 'Settings', path: ROUTES.SETTINGS },
    ],
  },
];

export const routeMeta: Record<string, RouteMeta> = {
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard',
    subtitle: 'Overview',
    breadcrumb: 'Dashboard / Overview',
  },
  [ROUTES.CALENDAR]: {
    title: 'Master Calendar',
    subtitle: 'Color-coded by language · Click slot to edit',
    breadcrumb: 'Schedule / Calendar',
  },
  [ROUTES.CREATE_TOUR]: {
    title: 'Create Tour Slot',
    subtitle: 'Publish a new tour opening for guide applications',
    breadcrumb: 'Schedule / Create Tour Slot',
  },
  '/schedule/tours/detail': {
    title: 'Tour Detail',
    subtitle: 'View tour slot information',
    breadcrumb: 'Schedule / Tour Detail',
  },
  [ROUTES.BULK]: {
    title: 'Bulk Schedule Creator',
    subtitle: 'Create recurring tour slots across a date range in 5 steps',
    breadcrumb: 'Schedule / Bulk Creator',
  },
  [ROUTES.IMPORT]: {
    title: 'Import from Reservation System',
    breadcrumb: 'Schedule / Import & Sync',
  },
  [ROUTES.GUIDES]: {
    title: 'Guide Roster',
    subtitle: '48 total · 44 active · 3 pending · 1 inactive',
    breadcrumb: 'Guides / Guide Roster',
  },
  [ROUTES.APPROVALS]: {
    title: 'New Guide Approvals',
    subtitle: '3 guides awaiting review',
    breadcrumb: 'Guides / New Approvals',
  },
  '/guides/guide-marco-rossi': {
    title: 'Guide Profile',
    subtitle: 'Marco Rossi',
    breadcrumb: 'Guides / Guide Profile',
  },
  [ROUTES.APPLICATIONS]: {
    title: 'Applications Calendar',
    subtitle: 'Click a day to view pending applications',
    breadcrumb: 'Applications / Calendar',
  },
  [ROUTES.GUIDE_SLOTS]: {
    title: 'Guide Slots',
    subtitle: 'Tour slots with pending guide applications',
    breadcrumb: 'Applications / Guide Slots',
  },
  [ROUTES.ASSIGNMENT]: {
    title: 'Tour Slot Assignment',
    subtitle: 'Assign guides to tour slot applicants',
    breadcrumb: 'Applications / Slot Assignment',
  },
  [ROUTES.PAYOUTS]: {
    title: 'Payout Requests',
    subtitle: '7 pending verification requests',
    breadcrumb: 'Payments / Payout Requests',
  },
  '/payments/payouts/payout-marco-march': {
    title: 'Payout Detail Review',
    subtitle: 'Marco Rossi · March 2026',
    breadcrumb: 'Payments / Payout Detail',
  },
  [ROUTES.REPORTS]: {
    title: 'Payment Reports',
    subtitle: 'April 2026 · All guides',
    breadcrumb: 'Payments / Reports',
  },
  [ROUTES.NOTIFICATIONS]: {
    title: 'Notifications & Announcements',
    breadcrumb: 'System / Notifications',
  },
  [ROUTES.SETTINGS]: {
    title: 'System Settings',
    breadcrumb: 'System / Settings',
  },
};

export function getRouteMeta(pathname: string): RouteMeta {
  if (routeMeta[pathname]) return routeMeta[pathname];

  if (pathname.startsWith('/guides/') && pathname !== ROUTES.APPROVALS) {
    return routeMeta['/guides/guide-marco-rossi'];
  }
  if (pathname.startsWith('/payments/payouts/') && pathname !== ROUTES.PAYOUTS) {
    return routeMeta['/payments/payouts/payout-marco-march'];
  }
  if (pathname.startsWith('/schedule/tours/')) {
    return routeMeta['/schedule/tours/detail'];
  }

  return {
    title: 'Page',
    breadcrumb: pathname,
  };
}

export function findNavKeyByPath(pathname: string): string {
  if (pathname === ROUTES.DASHBOARD) return 'dashboard';
  if (pathname.startsWith('/guides/') && pathname !== ROUTES.APPROVALS) return 'guides';
  if (pathname.startsWith('/schedule/tours/')) return 'calendar';
  if (pathname.startsWith('/payments/payouts/') && pathname !== ROUTES.PAYOUTS) return 'payout-detail';

  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.path === pathname) return item.key;
    }
  }
  return 'dashboard';
}
