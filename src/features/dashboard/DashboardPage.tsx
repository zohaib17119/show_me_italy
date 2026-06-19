import { Collapse, Row, Col } from 'antd';
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
  return (
    <div>
      <DashHero />
      <KpiRow />
      <UnfilledBanner />

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
