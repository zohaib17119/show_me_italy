import { ROUTES } from '@/constants/routes';

/** Nav item key → required permission claim. */
export const NAV_PERMISSION_BY_KEY: Record<string, string> = {
  dashboard: 'Dashboard.View',
  calendar: 'Schedule.View',
  'create-tour': 'Schedule.Create',
  bulk: 'Schedule.Bulk',
  import: 'Schedule.Import',
  guides: 'Guides.View',
  approvals: 'Guides.Approve',
  applications: 'Applications.View',
  assignment: 'Applications.Assign',
  reports: 'Payments.Reports.View',
  notifications: 'Notifications.View',
  settings: 'Settings.View',
};

/** Route pathname prefixes / exact paths → required permission. */
export const ROUTE_PERMISSIONS: { match: (pathname: string) => boolean; permission: string }[] = [
  { match: (p) => p === ROUTES.DASHBOARD || p === '', permission: 'Dashboard.View' },
  { match: (p) => p.startsWith('/schedule/calendar'), permission: 'Schedule.View' },
  { match: (p) => p.startsWith('/schedule/create'), permission: 'Schedule.Create' },
  { match: (p) => p.startsWith('/schedule/edit'), permission: 'Schedule.Edit' },
  { match: (p) => p.startsWith('/schedule/tours'), permission: 'Schedule.View' },
  { match: (p) => p.startsWith('/schedule/bulk'), permission: 'Schedule.Bulk' },
  { match: (p) => p.startsWith('/schedule/import'), permission: 'Schedule.Import' },
  { match: (p) => p.startsWith('/guides/approvals'), permission: 'Guides.Approve' },
  {
    match: (p) => p === ROUTES.GUIDES || /^\/guides\/(?!approvals)[^/]+$/.test(p),
    permission: 'Guides.View',
  },
  {
    match: (p) => p === ROUTES.APPLICATIONS || p.startsWith('/applications/queue'),
    permission: 'Applications.View',
  },
  {
    match: (p) =>
      p.startsWith('/applications/slots') || p.startsWith('/applications/assignment'),
    permission: 'Applications.Assign',
  },
  { match: (p) => p.startsWith('/payments/reports'), permission: 'Payments.Reports.View' },
  { match: (p) => p.startsWith('/system/notifications'), permission: 'Notifications.View' },
  { match: (p) => p.startsWith('/system/settings'), permission: 'Settings.View' },
];

export const SETTINGS_PANEL_PERMISSIONS: Record<string, string> = {
  tourTypes: 'Settings.TourTypes',
  languages: 'Settings.Languages',
  adminUsers: 'Settings.AdminUsers',
  roles: 'Settings.Roles',
};

/** First allowed app path for redirect when current route is forbidden. */
export function firstAllowedPath(permissions: string[] | undefined | null): string {
  const perms = permissions ?? [];
  const order: { permission: string; path: string }[] = [
    { permission: 'Dashboard.View', path: ROUTES.DASHBOARD },
    { permission: 'Schedule.View', path: ROUTES.CALENDAR },
    { permission: 'Schedule.Create', path: ROUTES.CREATE_TOUR },
    { permission: 'Schedule.Bulk', path: ROUTES.BULK },
    { permission: 'Schedule.Import', path: ROUTES.IMPORT },
    { permission: 'Guides.View', path: ROUTES.GUIDES },
    { permission: 'Guides.Approve', path: ROUTES.APPROVALS },
    { permission: 'Applications.View', path: ROUTES.APPLICATIONS },
    { permission: 'Applications.Assign', path: ROUTES.GUIDE_SLOTS },
    { permission: 'Payments.Reports.View', path: ROUTES.REPORTS },
    { permission: 'Notifications.View', path: ROUTES.NOTIFICATIONS },
    { permission: 'Settings.View', path: ROUTES.SETTINGS },
  ];
  for (const item of order) {
    if (perms.includes(item.permission)) return item.path;
  }
  return ROUTES.LOGIN;
}

export function requiredPermissionForPath(pathname: string): string | null {
  for (const rule of ROUTE_PERMISSIONS) {
    if (rule.match(pathname)) return rule.permission;
  }
  return null;
}
