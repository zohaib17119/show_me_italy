import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  DataTable,
  GuideCell,
  showToast,
  StatMini,
  StatMiniRow,
  StatusBadge,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  MOCK_PAYOUT_REQUESTS,
  PAYOUT_SUMMARY,
  type PayoutRequest,
  type PayoutStatus,
} from '@/mocks';
import type { TourStatus } from '@/types';

function payoutStatusToBadge(status: PayoutStatus): TourStatus {
  const map: Record<PayoutStatus, TourStatus> = {
    pending: 'pending',
    revision: 'denied',
    paid: 'completed',
    denied: 'denied',
  };
  return map[status];
}

export function PayoutsPage() {
  const navigate = useNavigate();
  const meta = getRouteMeta(ROUTES.PAYOUTS);

  const columns: ColumnsType<PayoutRequest> = useMemo(
    () => [
      {
        title: 'Guide',
        key: 'guide',
        render: (_, row) => (
          <GuideCell initials={row.guideInitials} name={row.guideName} />
        ),
      },
      { title: 'Month', dataIndex: 'monthLabel', key: 'month' },
      { title: 'Tours', dataIndex: 'tours', key: 'tours' },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount: number) => <strong>€{amount}</strong>,
      },
      {
        title: 'Submitted',
        dataIndex: 'submittedAt',
        key: 'submittedAt',
        render: (value: string) => (
          <span style={{ color: 'var(--text-muted)' }}>{value}</span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: PayoutStatus) => (
          <StatusBadge status={payoutStatusToBadge(status)} />
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, row) => (
          <AppButton
            variant="primary"
            onClick={() => navigate(`/payments/payouts/${row.id}`)}
          >
            Review →
          </AppButton>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div>
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        extra={
          <AppButton variant="secondary" onClick={() => showToast('Export started')}>
            Export CSV
          </AppButton>
        }
      />

      <StatMiniRow>
        <StatMini icon="💰" value={`€${PAYOUT_SUMMARY.totalPending.toLocaleString()}`} label="Total Pending" />
        <StatMini
          icon="✅"
          value={`€${PAYOUT_SUMMARY.paidThisMonth.toLocaleString()}`}
          label="Paid This Month"
          iconClassName=""
        />
        <StatMini icon="⏳" value={PAYOUT_SUMMARY.queueCount} label="Queue" />
        <StatMini
          icon="⚠️"
          value={PAYOUT_SUMMARY.revisionNeeded}
          label="Revision Needed"
        />
      </StatMiniRow>

      <DataTable<PayoutRequest>
        rowKey="id"
        columns={columns}
        dataSource={MOCK_PAYOUT_REQUESTS}
        pagination={false}
      />
    </div>
  );
}
