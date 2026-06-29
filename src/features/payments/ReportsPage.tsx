import { useEffect, useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  DataTable,
  GuideCell,
  LoadingOverlay,
  showToast,
  StatMini,
  StatMiniRow,
  StatusBadge,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import type { PaymentReport } from '@/mocks/payouts';
import {
  fetchWalletData,
  selectWalletStatus,
  selectWalletSummary,
  selectWalletTransactions,
} from '@/features/wallet/walletSlice';

export function ReportsPage() {
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.REPORTS);
  const transactions = useAppSelector(selectWalletTransactions);
  const summary = useAppSelector(selectWalletSummary);
  const status = useAppSelector(selectWalletStatus);

  useEffect(() => {
    void dispatch(fetchWalletData());
  }, [dispatch]);

  const reports: PaymentReport[] = useMemo(
    () =>
      transactions
        .filter((t) => t.status === 'paid')
        .map((t) => ({
          id: t.id,
          guideId: t.guideId,
          guideName: t.guideName,
          guideInitials: t.guideInitials,
          month: t.month,
          monthLabel: t.monthLabel,
          tours: t.tours,
          amount: t.amount,
          languages: ['EN'] as PaymentReport['languages'],
          datePaid: t.submittedAt,
          transferId: `TRF-${t.id}`,
          status: 'paid' as const,
        })),
    [transactions],
  );

  const columns: ColumnsType<PaymentReport> = useMemo(
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
      { title: 'Date Paid', dataIndex: 'datePaid', key: 'datePaid' },
      {
        title: 'Transfer ID',
        dataIndex: 'transferId',
        key: 'transferId',
        render: (id: string) => (
          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{id}</span>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        render: () => <StatusBadge status="completed" />,
      },
    ],
    [],
  );

  return (
    <div>
      <LoadingOverlay visible={status === 'loading'} />
      <PageHeader
        title={meta.title}
        subtitle={meta.subtitle}
        extra={
          <>
            <AppButton variant="secondary" onClick={() => showToast('CSV export started')}>
              Export CSV
            </AppButton>
            <AppButton variant="secondary" onClick={() => showToast('PDF export started')}>
              Export PDF
            </AppButton>
          </>
        }
      />

      <StatMiniRow>
        <StatMini icon="💰" value={`€${summary.paidThisMonth.toLocaleString()}`} label="Paid This Month" />
        <StatMini icon="📈" value={`€${summary.paidThisMonth.toLocaleString()}`} label="Paid This Period" />
        <StatMini icon="⏳" value={`€${summary.totalPending.toLocaleString()}`} label="Outstanding" />
        <StatMini icon="👥" value={reports.length} label="Guides Paid" />
      </StatMiniRow>

      <DataTable<PaymentReport>
        rowKey="id"
        columns={columns}
        dataSource={reports}
        pagination={false}
      />
    </div>
  );
}
