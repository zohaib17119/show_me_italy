import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { ROUTES } from '@/constants/routes';

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
    <Spin size="large" />
  </div>
);

const lazyPage = (factory: () => Promise<{ default: React.ComponentType }>) => {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: lazyPage(() =>
      import('@/features/auth/LoginPage').then((m) => ({
        default: m.LoginPage,
      })),
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: lazyPage(() =>
          import('@/features/dashboard/DashboardPage').then((m) => ({
            default: m.DashboardPage,
          })),
        ),
      },
      {
        path: 'schedule/calendar',
        element: lazyPage(() =>
          import('@/features/schedule/CalendarPage').then((m) => ({
            default: m.CalendarPage,
          })),
        ),
      },
      {
        path: 'schedule/create',
        element: lazyPage(() =>
          import('@/features/schedule/CreateTourPage').then((m) => ({
            default: m.CreateTourPage,
          })),
        ),
      },
      {
        path: 'schedule/tours/:id',
        element: lazyPage(() =>
          import('@/features/schedule/TourDetailPage').then((m) => ({
            default: m.TourDetailPage,
          })),
        ),
      },
      {
        path: 'schedule/bulk',
        element: lazyPage(() =>
          import('@/features/schedule/BulkCreatorPage').then((m) => ({
            default: m.BulkCreatorPage,
          })),
        ),
      },
      {
        path: 'schedule/import',
        element: lazyPage(() =>
          import('@/features/schedule/ImportSyncPage').then((m) => ({
            default: m.ImportSyncPage,
          })),
        ),
      },
      {
        path: 'guides',
        element: lazyPage(() =>
          import('@/features/guides/GuideRosterPage').then((m) => ({
            default: m.GuideRosterPage,
          })),
        ),
      },
      {
        path: 'guides/approvals',
        element: lazyPage(() =>
          import('@/features/guides/ApprovalsPage').then((m) => ({
            default: m.ApprovalsPage,
          })),
        ),
      },
      {
        path: 'guides/:id',
        element: lazyPage(() =>
          import('@/features/guides/GuideDetailPage').then((m) => ({
            default: m.GuideDetailPage,
          })),
        ),
      },
      {
        path: 'applications',
        element: lazyPage(() =>
          import('@/features/applications/ApplicationsCalendarPage').then((m) => ({
            default: m.ApplicationsCalendarPage,
          })),
        ),
      },
      {
        path: 'applications/queue/:date',
        element: lazyPage(() =>
          import('@/features/applications/ApplicationsQueuePage').then((m) => ({
            default: m.ApplicationsQueuePage,
          })),
        ),
      },
      {
        path: 'applications/slots',
        element: lazyPage(() =>
          import('@/features/applications/GuideSlotsPage').then((m) => ({
            default: m.GuideSlotsPage,
          })),
        ),
      },
      {
        path: 'applications/assignment',
        element: lazyPage(() =>
          import('@/features/applications/AssignmentPage').then((m) => ({
            default: m.AssignmentPage,
          })),
        ),
      },
      {
        path: 'payments/payouts',
        element: lazyPage(() =>
          import('@/features/payments/PayoutsPage').then((m) => ({
            default: m.PayoutsPage,
          })),
        ),
      },
      {
        path: 'payments/payouts/:id',
        element: lazyPage(() =>
          import('@/features/payments/PayoutDetailPage').then((m) => ({
            default: m.PayoutDetailPage,
          })),
        ),
      },
      {
        path: 'payments/reports',
        element: lazyPage(() =>
          import('@/features/payments/ReportsPage').then((m) => ({
            default: m.ReportsPage,
          })),
        ),
      },
      {
        path: 'system/notifications',
        element: lazyPage(() =>
          import('@/features/system/NotificationsPage').then((m) => ({
            default: m.NotificationsPage,
          })),
        ),
      },
      {
        path: 'system/settings',
        element: lazyPage(() =>
          import('@/features/system/SettingsPage').then((m) => ({
            default: m.SettingsPage,
          })),
        ),
      },
      { path: '*', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
    ],
  },
]);
