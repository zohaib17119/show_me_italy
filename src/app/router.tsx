import { lazy, Suspense, useEffect } from 'react';
import {
    createBrowserRouter,
    Navigate,
    isRouteErrorResponse,
    useRouteError,
} from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { ROUTES } from '@/constants/routes';

const PageLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
    </div>
);

const CHUNK_RELOAD_KEY = 'smi_chunk_reload_at';

function isStaleChunkError(error: unknown): boolean {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
                ? error
                : String((error as { message?: unknown })?.message ?? error ?? '');
    return (
        /Failed to fetch dynamically imported module/i.test(message) ||
        /error loading dynamically imported module/i.test(message) ||
        /Importing a module script failed/i.test(message) ||
        /Loading chunk [\d]+ failed/i.test(message) ||
        (error instanceof Error && error.name === 'ChunkLoadError')
    );
}

/**
 * After a deploy, open tabs keep old hashed chunk URLs. Vite then fails the
 * dynamic import (e.g. LightPage-XXXX.js 404). Reload once to pick up the new index.
 */
function importWithChunkRecovery<T>(factory: () => Promise<T>): Promise<T> {
    return factory().catch((error: unknown) => {
        if (typeof window !== 'undefined' && isStaleChunkError(error)) {
            const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
            const now = Date.now();
            // Avoid reload loops if the new build is also broken.
            if (!lastReload || now - lastReload > 15_000) {
                sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
                window.location.reload();
                return new Promise<T>(() => {
                    /* pending until reload */
                });
            }
        }
        throw error;
    });
}

function RouteErrorFallback() {
    const error = useRouteError();
    const stale = isStaleChunkError(error);

    useEffect(() => {
        if (!stale || typeof window === 'undefined') return;
        const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) ?? 0);
        const now = Date.now();
        if (!lastReload || now - lastReload > 15_000) {
            sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
            window.location.reload();
        }
    }, [stale]);

    const title = stale ? 'App updated' : 'Unexpected Application Error';
    const subTitle = stale
        ? 'A newer version of the app was deployed. Reloading to load the latest assets...'
        : isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
                ? error.message
                : 'Something went wrong.';

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Result
                status={stale ? 'info' : 'error'}
                title={title}
                subTitle={subTitle}
                extra={
                    <Button type="primary" onClick={() => window.location.reload()}>
                        Reload page
                    </Button>
                }
            />
        </div>
    );
}

const lazyPage = (factory: () => Promise<{ default: React.ComponentType }>) => {
    const Component = lazy(() => importWithChunkRecovery(factory));
    return (
        <Suspense fallback={<PageLoader />}>
            <Component />
        </Suspense>
    );
};

export const router = createBrowserRouter([
    {
        path: ROUTES.LOGIN,
        errorElement: <RouteErrorFallback />,
        element: lazyPage(() =>
            import('@/features/auth/LoginPage').then((m) => ({
                default: m.LoginPage,
            })),
        ),
    },
    {
        path: '/',
        errorElement: <RouteErrorFallback />,
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
                path: 'schedule/edit/:id',
                element: lazyPage(() =>
                    import('@/features/schedule/EditTourPage').then((m) => ({
                        default: m.EditTourPage,
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
            // Hidden until payouts work resumes:
            // {
            // path: 'payments/payouts',
            // element: lazyPage(() =>
            // import('@/features/payments/PayoutsPage').then((m) => ({
            // default: m.PayoutsPage,
            // })),
            // ),
            // },
            // {
            // path: 'payments/payouts/:id',
            // element: lazyPage(() =>
            // import('@/features/payments/PayoutDetailPage').then((m) => ({
            // default: m.PayoutDetailPage,
            // })),
            // ),
            // },
            {
                path: 'payments/reports',
                element: lazyPage(() =>
                    import('@/features/payments/ReportsPage').then((m) => ({
                        default: m.ReportsPage,
                    })),
                ),
            },
            {
                path: 'payments/reports/:guideId',
                element: lazyPage(() =>
                    import('@/features/payments/GuideEarningsBreakdownPage').then((m) => ({
                        default: m.GuideEarningsBreakdownPage,
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
