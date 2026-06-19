import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PlaceholderPage } from '@/components/ui/PlaceholderPage';
import { ROUTES } from '@/constants/routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'schedule/calendar', element: <PlaceholderPage /> },
      { path: 'schedule/create', element: <PlaceholderPage /> },
      { path: 'schedule/bulk', element: <PlaceholderPage /> },
      { path: 'schedule/import', element: <PlaceholderPage /> },
      { path: 'guides', element: <PlaceholderPage /> },
      { path: 'guides/approvals', element: <PlaceholderPage /> },
      { path: 'guides/:id', element: <PlaceholderPage /> },
      { path: 'applications', element: <PlaceholderPage /> },
      { path: 'applications/assignment', element: <PlaceholderPage /> },
      { path: 'payments/payouts', element: <PlaceholderPage /> },
      { path: 'payments/payouts/:id', element: <PlaceholderPage /> },
      { path: 'payments/reports', element: <PlaceholderPage /> },
      { path: 'system/notifications', element: <PlaceholderPage /> },
      { path: 'system/settings', element: <PlaceholderPage /> },
      { path: '*', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
    ],
  },
]);
