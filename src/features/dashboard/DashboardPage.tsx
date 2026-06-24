import { useEffect } from 'react';
import { Collapse, Row, Col } from 'antd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  fetchAllAgents,
  selectActiveGuideCount,
  selectUnverifiedGuides,
} from '@/features/agent/agentSlice';
import { fetchApplications, selectPendingApplicationCount } from '@/features/applications/applicationsSlice';
import { fetchLanguages } from '@/features/language/languageSlice';
import {
  fetchNotifications,
  setBadgeCounts,
} from '@/features/notifications/notificationSlice';
import { fetchTours, selectTourItems, selectUnfilledCount } from '@/features/tour/tourSlice';
import { fetchTourTypes } from '@/features/tourType/tourTypeSlice';
import { fetchWalletData, selectWalletSummary } from '@/features/wallet/walletSlice';
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
  const activeGuides = useAppSelector(selectActiveGuideCount);
  const pendingApprovals = useAppSelector(selectUnverifiedGuides).length;
  const pendingApps = useAppSelector(selectPendingApplicationCount);
  const walletSummary = useAppSelector(selectWalletSummary);
  const unfilled = useAppSelector(selectUnfilledCount);
  const tours = useAppSelector(selectTourItems);

  useEffect(() => {
    void dispatch(fetchTourTypes());
    void dispatch(fetchLanguages());
    void dispatch(fetchTours());
    void dispatch(fetchAllAgents());
    void dispatch(fetchApplications());
    void dispatch(fetchWalletData());
    void dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      setBadgeCounts({
        guides: activeGuides,
        approvals: pendingApprovals,
        applications: pendingApps,
        payouts: walletSummary.queueCount,
        notifications: 0,
      }),
    );
  }, [dispatch, activeGuides, pendingApprovals, pendingApps, walletSummary.queueCount]);

  return (
    <div>
      <DashHero />
      <KpiRow />
      {unfilled > 0 && <UnfilledBanner />}

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
                  Analytics (Phase 2) — v1 Finbord widgets · {tours.length} API tours loaded
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
