import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/ui/StatCard';
import { ROUTES } from '@/constants/routes';

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

  return (
    <div className="kpi-row" id="kpiRow">
      <StatCard
        icon="🗓️"
        value={8}
        label="Tours Today"
        sub="vs 6 yesterday"
        trend={<TrendPill variant="up">▲ +2</TrendPill>}
        accentColor="#27AE60"
        onClick={() => navigate(ROUTES.CALENDAR)}
      />
      <StatCard
        icon="📅"
        value={34}
        label="This Week"
        sub="tours scheduled"
        trend={<TrendPill variant="up">▲ 12%</TrendPill>}
        accentColor="#2E75B6"
      />
      <StatCard
        icon="⚠️"
        value={5}
        label="Unfilled Slots"
        sub="assign guides →"
        trend={<TrendPill variant="dn">Urgent</TrendPill>}
        valueColor="#E74C3C"
        alert
        onClick={() => navigate(ROUTES.ASSIGNMENT)}
      />
      <StatCard
        icon="⏳"
        value={12}
        label="Pending Apps"
        sub="awaiting decision"
        trend={<TrendPill variant="warn">Review</TrendPill>}
        valueColor="#92400E"
        warn
        onClick={() => navigate(ROUTES.APPLICATIONS)}
      />
      <StatCard
        icon="💰"
        value={7}
        label="Payout Requests"
        sub="pending review"
        trend={<TrendPill variant="warn">€4,230</TrendPill>}
        accentColor="#F59E0B"
        onClick={() => navigate(ROUTES.PAYOUTS)}
      />
      <StatCard
        icon="👥"
        value={48}
        label="Active Guides"
        sub="3 new this week"
        trend={<TrendPill variant="up">▲ +3</TrendPill>}
        accentColor="#27AE60"
        onClick={() => navigate(ROUTES.GUIDES)}
      />
    </div>
  );
}
