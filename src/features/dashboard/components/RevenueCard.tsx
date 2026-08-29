import { Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/constants/routes';
import { selectDashboardData } from '@/features/dashboard/dashboardSlice';

export function RevenueCard() {
  const navigate = useNavigate();
  const dashboard = useAppSelector(selectDashboardData);
  const totalEarnings = dashboard?.stats?.totalEarnings ?? 0;

  return (
    <Card
      id="revenueCard"
      hoverable
      onClick={() => navigate(ROUTES.REPORTS)}
      styles={{ body: { padding: '14px 16px', cursor: 'pointer' } }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Payouts this month
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
          }}
        >
          €{totalEarnings.toLocaleString()}
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--g600)',
          }}
        >
          View reports →
        </div>
      </div>
    </Card>
  );
}
