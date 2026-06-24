import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
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
import {
  fetchApplications,
  selectApplications,
  selectApplicationsStatus,
} from '@/features/applications/applicationsSlice';
import type { Application } from '@/mocks/applications';

const PAGE_SIZE = 10;

export function ApplicationsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.APPLICATIONS);
  const applications = useAppSelector(selectApplications);
  const status = useAppSelector(selectApplicationsStatus);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useEffect(() => {
    void dispatch(fetchApplications());
  }, [dispatch]);

  useEffect(() => {
    if (applications.length > 0 && selectedKeys.length === 0) {
      setSelectedKeys(applications.map((a) => a.id));
    }
  }, [applications, selectedKeys.length]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        search.trim() === '' ||
        app.guideName.toLowerCase().includes(search.toLowerCase()) ||
        app.tour.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        render: (s: Application['status']) => <StatusBadge status={s} />,
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
              <AppButton variant="primary" size="xs" onClick={() => showToast('✓ Approved!')}>
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

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      <FilterBar>
        <SearchInput
          placeholder="Search…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'denied', label: 'Denied' },
          ]}
        />
      </FilterBar>

      <BulkActionBar selectedCount={selectedKeys.length}>
        <AppButton variant="primary" onClick={() => showToast('✓ Bulk approved')}>
          ✓ Approve All
        </AppButton>
        <AppButton variant="danger" onClick={() => showToast('Bulk denied')}>
          ✕ Deny All
        </AppButton>
      </BulkActionBar>

      <DataTable<Application>
        rowKey="id"
        columns={columns}
        dataSource={pageData}
        pagination={false}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: (keys) => setSelectedKeys(keys as string[]),
        }}
        footer={() => (
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        )}
      />
    </div>
  );
}
