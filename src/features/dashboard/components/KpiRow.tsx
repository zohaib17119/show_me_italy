import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { StatCard } from '@/components/ui/StatCard';
import { ROUTES } from '@/constants/routes';
import { selectActiveGuideCount } from '@/features/agent/agentSlice';
import { selectPendingApplicationCount } from '@/features/applications/applicationsSlice';
import {
  selectTodayTours,
  selectTourItems,
  selectUnfilledCount,
} from '@/features/tour/tourSlice';
import { selectWalletSummary } from '@/features/wallet/walletSlice';

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
  const todayTours = useAppSelector(selectTodayTours);
  const allTours = useAppSelector(selectTourItems);
  const unfilled = useAppSelector(selectUnfilledCount);
  const pendingApps = useAppSelector(selectPendingApplicationCount);
  const walletSummary = useAppSelector(selectWalletSummary);
  const activeGuides = useAppSelector(selectActiveGuideCount);

  return (
    <div className="kpi-row" id="kpiRow">
      <StatCard
        icon="🗓️"
        value={todayTours.length}
        label="Tours Today"
        sub={`${allTours.length} total scheduled`}
        trend={<TrendPill variant="up">Live</TrendPill>}
        accentColor="#27AE60"
        onClick={() => navigate(ROUTES.CALENDAR)}
      />
      <StatCard
        icon="📅"
        value={allTours.length}
        label="All Slots"
        sub="from API"
        trend={<TrendPill variant="up">API</TrendPill>}
        accentColor="#2E75B6"
        onClick={() => navigate(ROUTES.CALENDAR)}
      />
      <StatCard
        icon="⚠️"
        value={unfilled}
        label="Unfilled Slots"
        sub="assign guides →"
        trend={<TrendPill variant="dn">Urgent</TrendPill>}
        valueColor="#E74C3C"
        alert
        onClick={() => navigate(ROUTES.ASSIGNMENT)}
      />
      <StatCard
        icon="⏳"
        value={pendingApps}
        label="Pending Apps"
        sub="awaiting decision"
        trend={<TrendPill variant="warn">Review</TrendPill>}
        valueColor="#92400E"
        warn
        onClick={() => navigate(ROUTES.APPLICATIONS)}
      />
      <StatCard
        icon="💰"
        value={walletSummary.queueCount}
        label="Payout Requests"
        sub="pending review"
        trend={<TrendPill variant="warn">€{walletSummary.totalPending.toLocaleString()}</TrendPill>}
        accentColor="#F59E0B"
        onClick={() => navigate(ROUTES.PAYOUTS)}
      />
      <StatCard
        icon="👥"
        value={activeGuides}
        label="Active Guides"
        sub="verified agents"
        trend={<TrendPill variant="up">Live</TrendPill>}
        accentColor="#27AE60"
        onClick={() => navigate(ROUTES.GUIDES)}
      />
    </div>
  );
}
