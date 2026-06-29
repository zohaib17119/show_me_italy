import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  DataTable,
  FilterBar,
  FilterSelect,
  GuideCell,
  LangChip,
  ListErrorState,
  SearchInput,
  showToast,
  StatusBadge,
  TablePagination,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import {
  approveApplication,
  fetchApplications,
  selectApplications,
  selectApplicationsError,
  selectApplicationsMutationStatus,
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
  const error = useAppSelector(selectApplicationsError);
  const mutationStatus = useAppSelector(selectApplicationsMutationStatus);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const loadApplications = useCallback(() => {
    void dispatch(fetchApplications());
  }, [dispatch]);

  useFetchErrorToast(status, error);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const query = search.trim().toLowerCase();
      if (query === '') return true;
      return (
        app.guideName.toLowerCase().includes(query) ||
        app.tour.toLowerCase().includes(query)
      );
    });
  }, [applications, search]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApprove = useCallback(
    async (applicationId: number) => {
      setApprovingId(applicationId);
      try {
        await dispatch(approveApplication(applicationId)).unwrap();
        showToast('✓ Application approved');
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to approve application');
      } finally {
        setApprovingId(null);
      }
    },
    [dispatch],
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
        title: 'Pay Rate',
        dataIndex: 'payRate',
        key: 'payRate',
        render: (value: string) => <strong>{value}</strong>,
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
        render: (_, row) => (
          <div style={{ display: 'flex', gap: 5 }}>
            <AppButton
              variant="primary"
              size="xs"
              disabled={mutationStatus === 'loading' && approvingId === row.applicationId}
              onClick={() => void handleApprove(row.applicationId)}
            >
              Approve
            </AppButton>
            <AppButton
              variant="secondary"
              size="xs"
              onClick={() => navigate(ROUTES.GUIDE_SLOTS)}
            >
              Assign
            </AppButton>
          </div>
        ),
      },
    ],
    [approvingId, handleApprove, mutationStatus, navigate],
  );

  return (
    <div>
      <PageHeader
        title={meta.title}
        subtitle={`${applications.length} pending · nearest first`}
        extra={
          <AppButton variant="secondary" onClick={() => showToast('Export started')}>
            Export CSV
          </AppButton>
        }
      />

      {status === 'loading' && applications.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      {status === 'failed' && (
        <ListErrorState message={error} onRetry={loadApplications} />
      )}

      {status !== 'failed' && (
        <>
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
          </FilterBar>

          {/* TODO: restore when bulk approve/reject API is available
          <BulkActionBar selectedCount={selectedKeys.length}>
            <AppButton variant="primary" onClick={() => showToast('✓ Bulk approved')}>
              ✓ Approve All
            </AppButton>
            <AppButton variant="danger" onClick={() => showToast('Bulk denied')}>
              ✕ Deny All
            </AppButton>
          </BulkActionBar>
          */}

          <DataTable<Application>
            rowKey="id"
            columns={columns}
            dataSource={pageData}
            pagination={false}
            footer={() => (
              <TablePagination
                page={page}
                pageSize={PAGE_SIZE}
                total={filtered.length}
                onPageChange={setPage}
              />
            )}
          />
        </>
      )}
    </div>
  );
}
