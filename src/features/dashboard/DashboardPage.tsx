import { useEffect } from 'react';
import { Collapse, Row, Col, Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { ListErrorState } from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import {
  fetchDashboard,
  selectDashboardData,
  selectDashboardError,
  selectDashboardStatus,
} from '@/features/dashboard/dashboardSlice';
import { setBadgeCounts } from '@/features/notifications/notificationSlice';
import { DashHero } from './components/DashHero';
import { KpiRow } from './components/KpiRow';
import { UnfilledBanner } from './components/UnfilledBanner';
import { TodaySchedule } from './components/TodaySchedule';
import { QuickActions } from './components/QuickActions';
import { GuidesOnline } from './components/GuidesOnline';
import { RevenueCard } from './components/RevenueCard';
import { LanguageDistribution } from './components/LanguageDistribution';
import { WeekMini } from './components/WeekMini';
import { ActivityFeed } from './components/ActivityFeed';
import { CashflowChart } from './widgets/CashflowChart';
import { LanguageDonut } from './widgets/LanguageDonut';
import { RecentActivityTable } from './widgets/RecentActivityTable';
import { TourTargets } from './widgets/TourTargets';
import styles from './dashboard.module.css';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector(selectDashboardData);
  const status = useAppSelector(selectDashboardStatus);
  const error = useAppSelector(selectDashboardError);

  useFetchErrorToast(status, error);

  useEffect(() => {
    void dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (!dashboard) return;
    dispatch(
      setBadgeCounts({
        guides: dashboard.stats?.activeGuides ?? 0,
        approvals: dashboard.quickActions?.pendingGuideApprovals ?? 0,
        applications: dashboard.stats?.pendingApplications ?? 0,
        payouts: dashboard.stats?.pendingPayouts ?? 0,
        notifications: dashboard.activity?.activities?.length ?? 0,
      }),
    );
  }, [dispatch, dashboard]);

  if (status === 'loading' && !dashboard) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (status === 'failed' && !dashboard) {
    return (
      <ListErrorState
        message={error}
        loading={false}
        onRetry={() => void dispatch(fetchDashboard())}
      />
    );
  }

  const unfilled = dashboard?.stats?.unfilledSlots ?? 0;

  return (
    <div>
      <DashHero />
      <KpiRow />
      {unfilled > 0 && <UnfilledBanner count={unfilled} />}

      <div className="dash-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <TodaySchedule />
          <QuickActions />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <GuidesOnline />
          <RevenueCard />
          <LanguageDistribution />
          <WeekMini />
          <ActivityFeed />
        </div>
      </div>

      <div className={styles.analyticsSection}>
        <Collapse
          items={[
            {
              key: 'analytics',
              label: (
                <span style={{ fontWeight: 700, fontSize: 13 }}>
                  Analytics (Phase 2) — v1 Finbord widgets
                </span>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={14}>
                    <CashflowChart />
                  </Col>
                  <Col xs={24} lg={10}>
                    <LanguageDonut />
                  </Col>
                  <Col xs={24} lg={14}>
                    <RecentActivityTable />
                  </Col>
                  <Col xs={24} lg={10}>
                    <TourTargets />
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
