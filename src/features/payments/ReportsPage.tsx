import { useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  DataTable,
  GuideCell,
  LangChip,
  showToast,
  StatMini,
  StatMiniRow,
  StatusBadge,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { MOCK_PAYMENT_REPORTS, PAYOUT_SUMMARY, type PaymentReport } from '@/mocks';

export function ReportsPage() {
  const meta = getRouteMeta(ROUTES.REPORTS);

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
      {
        title: 'Languages',
        dataIndex: 'languages',
        key: 'languages',
        render: (langs: PaymentReport['languages']) => (
          <span style={{ display: 'inline-flex', gap: 4 }}>
            {langs.map((code) => (
              <LangChip key={code} code={code} />
            ))}
          </span>
        ),
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
        dataIndex: 'status',
        key: 'status',
        render: () => <StatusBadge status="completed" />,
      },
    ],
    [],
  );

  return (
    <div>
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
        <StatMini
          icon="💰"
          value={`€${PAYOUT_SUMMARY.paidThisMonth.toLocaleString()}`}
          label="Paid This Month"
        />
        <StatMini
          icon="📈"
          value={`€${PAYOUT_SUMMARY.paidThisYear.toLocaleString()}`}
          label="Paid This Year"
        />
        <StatMini
          icon="⏳"
          value={`€${PAYOUT_SUMMARY.outstanding.toLocaleString()}`}
          label="Outstanding"
        />
        <StatMini icon="👥" value={PAYOUT_SUMMARY.guidesPaid} label="Guides Paid" />
      </StatMiniRow>

      <DataTable<PaymentReport>
        rowKey="id"
        columns={columns}
        dataSource={MOCK_PAYMENT_REPORTS}
        pagination={false}
      />
    </div>
  );
}
