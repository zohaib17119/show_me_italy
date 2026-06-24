import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
import type { PayoutRequest, PayoutStatus } from '@/mocks/payouts';
import {
  fetchWalletData,
  selectWalletStatus,
  selectWalletSummary,
  selectWalletTransactions,
} from '@/features/wallet/walletSlice';
import type { TourStatus } from '@/types';

function payoutStatusToBadge(s: PayoutStatus): TourStatus {
  const map: Record<PayoutStatus, TourStatus> = {
    pending: 'pending',
    revision: 'denied',
    paid: 'completed',
    denied: 'denied',
  };
  return map[s];
}

export function PayoutsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.PAYOUTS);
  const transactions = useAppSelector(selectWalletTransactions);
  const summary = useAppSelector(selectWalletSummary);
  const status = useAppSelector(selectWalletStatus);

  useEffect(() => {
    void dispatch(fetchWalletData());
  }, [dispatch]);

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
        render: (s: PayoutStatus) => <StatusBadge status={payoutStatusToBadge(s)} />,
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

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      <StatMiniRow>
        <StatMini icon="💰" value={`€${summary.totalPending.toLocaleString()}`} label="Total Pending" />
        <StatMini icon="✅" value={`€${summary.paidThisMonth.toLocaleString()}`} label="Paid This Month" />
        <StatMini icon="⏳" value={summary.queueCount} label="Queue" />
        <StatMini icon="⚠️" value={summary.revisionNeeded} label="Revision Needed" />
      </StatMiniRow>

      <DataTable<PayoutRequest>
        rowKey="id"
        columns={columns}
        dataSource={transactions}
        pagination={false}
      />
    </div>
  );
}
