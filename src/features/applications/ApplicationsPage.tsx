import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BulkActionBar,
  DataTable,
  FilterBar,
  FilterSelect,
  GuideCell,
  LangChip,
  SearchInput,
  showToast,
  StatusBadge,
  TablePagination,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { MOCK_APPLICATIONS, type Application } from '@/mocks';

const PAGE_SIZE = 10;

export function ApplicationsPage() {
  const navigate = useNavigate();
  const meta = getRouteMeta(ROUTES.APPLICATIONS);
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    MOCK_APPLICATIONS.map((a) => a.id),
  );

  const columns: ColumnsType<Application> = useMemo(
    () => [
      {
        title: 'Guide',
        dataIndex: 'guideName',
        key: 'guide',
        render: (_, row) => (
          <GuideCell initials={row.guideInitials} name={row.guideName} />
        ),
      },
      { title: 'Tour', dataIndex: 'tour', key: 'tour' },
      {
        title: 'Date',
        dataIndex: 'dateLabel',
        key: 'date',
        render: (label: string) => <strong>{label}</strong>,
      },
      { title: 'Time', dataIndex: 'time', key: 'time' },
      {
        title: 'Language',
        dataIndex: 'language',
        key: 'language',
        render: (lang: Application['language']) => <LangChip code={lang} />,
      },
      {
        title: 'Applied At',
        dataIndex: 'appliedAt',
        key: 'appliedAt',
        render: (value: string) => (
          <span style={{ color: 'var(--text-muted)' }}>{value}</span>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: Application['status']) => <StatusBadge status={status} />,
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, row) =>
          row.status === 'approved' ? (
            <AppButton variant="secondary" size="xs">
              View
            </AppButton>
          ) : (
            <div style={{ display: 'flex', gap: 5 }}>
              <AppButton
                variant="primary"
                size="xs"
                onClick={() => showToast('✓ Approved!')}
              >
                ✓
              </AppButton>
              <AppButton variant="danger" size="xs" onClick={() => showToast('Denied')}>
                ✕
              </AppButton>
              <AppButton
                variant="secondary"
                size="xs"
                onClick={() => navigate(ROUTES.ASSIGNMENT)}
              >
                Assign
              </AppButton>
            </div>
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

      <FilterBar>
        <SearchInput placeholder="Search…" />
        <FilterSelect
          options={[
            { value: 'all', label: 'All Tours' },
            { value: 'colosseum', label: 'Colosseum Arena' },
          ]}
          defaultValue="all"
        />
        <FilterSelect
          options={[
            { value: 'all', label: 'All Languages' },
            { value: 'EN', label: 'English' },
            { value: 'IT', label: 'Italian' },
          ]}
          defaultValue="all"
        />
        <FilterSelect
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'denied', label: 'Denied' },
          ]}
          defaultValue="all"
        />
      </FilterBar>

      <BulkActionBar selectedCount={selectedKeys.length}>
        <AppButton variant="primary" onClick={() => showToast('✓ 5 approved!')}>
          ✓ Approve All
        </AppButton>
        <AppButton variant="danger" onClick={() => showToast('5 denied')}>
          ✕ Deny All
        </AppButton>
      </BulkActionBar>

      <DataTable<Application>
        rowKey="id"
        columns={columns}
        dataSource={MOCK_APPLICATIONS}
        pagination={false}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => setSelectedKeys(keys as string[]),
        }}
        footer={() => (
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={MOCK_APPLICATIONS.length}
            onPageChange={setPage}
          />
        )}
      />
    </div>
  );
}
