export interface PermissionDef {
  key: string;
  label: string;
}

export interface PermissionGroup {
  module: string;
  label: string;
  permissions: PermissionDef[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'Dashboard',
    label: 'Dashboard',
    permissions: [{ key: 'Dashboard.View', label: 'View dashboard' }],
  },
  {
    module: 'Schedule',
    label: 'Schedule',
    permissions: [
      { key: 'Schedule.View', label: 'View calendar' },
      { key: 'Schedule.Create', label: 'Create tour slot' },
      { key: 'Schedule.Edit', label: 'Edit tour slot' },
      { key: 'Schedule.Bulk', label: 'Bulk creator' },
      { key: 'Schedule.Import', label: 'Import / sync' },
    ],
  },
  {
    module: 'Guides',
    label: 'Guides',
    permissions: [
      { key: 'Guides.View', label: 'View guide roster' },
      { key: 'Guides.Edit', label: 'Edit guide profile' },
      { key: 'Guides.Approve', label: 'Approve guides' },
      { key: 'Guides.Reject', label: 'Reject guides' },
      { key: 'Guides.Activate', label: 'Activate guides' },
      { key: 'Guides.Deactivate', label: 'Deactivate guides' },
    ],
  },
  {
    module: 'Applications',
    label: 'Applications',
    permissions: [
      { key: 'Applications.View', label: 'View applications' },
      { key: 'Applications.Assign', label: 'Assign guides to slots' },
      { key: 'Applications.UpdateStatus', label: 'Update application status' },
    ],
  },
  {
    module: 'Payments',
    label: 'Payments',
    permissions: [
      { key: 'Payments.Reports.View', label: 'View payment reports' },
      // Hidden until payouts resume:
      // { key: 'Payments.Payouts.View', label: 'View payout requests' },
      // { key: 'Payments.Payouts.Process', label: 'Process payouts' },
    ],
  },
  {
    module: 'Notifications',
    label: 'Notifications',
    permissions: [
      { key: 'Notifications.View', label: 'View notifications' },
      { key: 'Notifications.Send', label: 'Send announcements' },
    ],
  },
  {
    module: 'Settings',
    label: 'Settings',
    permissions: [
      { key: 'Settings.View', label: 'View settings' },
      { key: 'Settings.TourTypes', label: 'Manage tour types' },
      { key: 'Settings.Languages', label: 'Manage languages' },
      { key: 'Settings.AdminUsers', label: 'Manage admin users' },
      { key: 'Settings.Roles', label: 'Manage roles & permissions' },
    ],
  },
];

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key),
);
