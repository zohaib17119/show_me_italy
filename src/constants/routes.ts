export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  CALENDAR: '/schedule/calendar',
  CREATE_TOUR: '/schedule/create',
  TOUR_DETAIL: '/schedule/tours/:id',
  BULK: '/schedule/bulk',
  IMPORT: '/schedule/import',
  GUIDES: '/guides',
  APPROVALS: '/guides/approvals',
  GUIDE_DETAIL: '/guides/:id',
  APPLICATIONS: '/applications',
  ASSIGNMENT: '/applications/assignment',
  PAYOUTS: '/payments/payouts',
  PAYOUT_DETAIL: '/payments/payouts/:id',
  REPORTS: '/payments/reports',
  NOTIFICATIONS: '/system/notifications',
  SETTINGS: '/system/settings',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export function getTourDetailPath(id: number | string): string {
  return `/schedule/tours/${id}`;
}
