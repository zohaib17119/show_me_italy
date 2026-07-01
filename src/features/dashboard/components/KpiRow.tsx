import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { StatCard } from '@/components/ui/StatCard';
import { ROUTES } from '@/constants/routes';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';

function TrendPill({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'up' | 'dn' | 'warn';
}) {
  const styles: Record<string, React.CSSProperties> = {
    up: { background: '#e0f5e9', color: '#1e8449' },
    dn: { background: '#fdecea', color: '#e74c3c' },
    warn: { background: '#fef3c7', color: '#92400e' },
  };
  return (
    <span
      style={{
        ...styles[variant],
        fontSize: 9,
        fontWeight: 700,
        padding: '2px 6px',
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

export function KpiRow() {
  const navigate = useNavigate();
  const dashboard = useAppSelector(selectDashboardData);
  const stats = dashboard?.stats;

  return (
    <div className="kpi-row" id="kpiRow">
      <StatCard
        icon="🗓️"
        value={stats?.toursToday ?? 0}
        label="Tours Today"
        sub={`${stats?.totalSlots ?? 0} total scheduled`}
        trend={<TrendPill variant="up">Live</TrendPill>}
        accentColor="#27AE60"
        onClick={() => navigate(ROUTES.CALENDAR)}
      />
      <StatCard
        icon="⚠️"
        value={stats?.unfilledSlots ?? 0}
        label="Unfilled Slots"
        sub="assign guides →"
        trend={<TrendPill variant="dn">Urgent</TrendPill>}
        valueColor="#E74C3C"
        alert
        onClick={() => navigate(ROUTES.GUIDE_SLOTS)}
      />
      <StatCard
        icon="⏳"
        value={stats?.pendingApplications ?? 0}
        label="Pending Applications"
        sub="awaiting decision"
        trend={<TrendPill variant="warn">Review</TrendPill>}
        valueColor="#92400E"
        warn
        onClick={() => navigate(ROUTES.APPLICATIONS)}
      />
      <StatCard
        icon="💰"
        value={stats?.pendingPayouts ?? 0}
        label="Payout Requests"
        sub="pending review"
        trend={
          <TrendPill variant="warn">
            €{(dashboard?.payout?.pendingAmount ?? 0).toLocaleString()}
          </TrendPill>
        }
        accentColor="#F59E0B"
        onClick={() => navigate(ROUTES.PAYOUTS)}
      />
      <StatCard
        icon="👥"
        value={stats?.activeGuides ?? 0}
        label="Active Guides"
        sub="verified agents"
        trend={<TrendPill variant="up">Live</TrendPill>}
        accentColor="#27AE60"
        onClick={() => navigate(ROUTES.GUIDES)}
      />
    </div>
  );
}
