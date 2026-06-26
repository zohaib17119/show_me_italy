import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BreadcrumbNav,
  BulkActionBar,
  DataTable,
  FilterBar,
  FilterSelect,
  GuideCell,
  LangChip,
  ListErrorState,
  SearchInput,
  StatusBadge,
  TablePagination,
  showToast,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { ROUTES } from '@/constants/routes';
import {
  fetchAdminGuides,
  selectAdminGuideError,
  selectAdminGuideStatus,
  selectAdminGuides,
} from '@/features/agent/agentSlice';
import type { Guide, GuideStatus } from '@/mocks/guides';
import type { TourStatus } from '@/types';

const PAGE_SIZE = 5;

function guideStatusToBadge(status: GuideStatus): TourStatus {
  if (status === 'active') return 'approved';
  if (status === 'pending') return 'pending';
  return 'denied';
}

export function GuideRosterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const guides = useAppSelector(selectAdminGuides);
  const status = useAppSelector(selectAdminGuideStatus);
  const error = useAppSelector(selectAdminGuideError);

  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  useFetchErrorToast(status, error);

  useEffect(() => {
    void dispatch(fetchAdminGuides({}));
  }, [dispatch]);

  const activeCount = guides.filter((g) => g.status === 'active').length;
  const pendingCount = guides.filter((g) => g.status === 'pending').length;
  const inactiveCount = guides.filter((g) => g.status === 'inactive').length;

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesSearch =
        search.trim() === '' ||
        guide.name.toLowerCase().includes(search.toLowerCase()) ||
        guide.email.toLowerCase().includes(search.toLowerCase());
      const matchesLang =
        languageFilter === 'all' || guide.languages.includes(languageFilter as Guide['languages'][0]);
      const matchesStatus = statusFilter === 'all' || guide.status === statusFilter;
      return matchesSearch && matchesLang && matchesStatus;
    });
  }, [guides, search, languageFilter, statusFilter]);

  const pageData = filteredGuides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnsType<Guide> = [
    {
      title: 'Guide',
      key: 'guide',
      render: (_, record) => (
        <GuideCell initials={record.initials} name={record.name} sub={record.email} />
      ),
    },
    {
      title: 'Languages',
      key: 'languages',
      render: (_, record) => (
        <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {record.languages.map((lang) => (
            <LangChip key={lang} code={lang} />
          ))}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => <StatusBadge status={guideStatusToBadge(record.status)} />,
    },
    {
      title: 'Certified',
      key: 'certified',
      render: (_, record) =>
        record.certified ? (
          <span style={{ color: 'var(--g600)', fontWeight: 700, fontSize: 12 }}>✓ Yes</span>
        ) : (
          <span style={{ color: 'var(--orange)', fontWeight: 700, fontSize: 12 }}>⏳</span>
        ),
    },
    {
      title: 'Tours',
      dataIndex: 'tours',
      key: 'tours',
      render: (tours: number) => <strong>{tours}</strong>,
    },
    {
      title: 'Rating',
      key: 'rating',
      render: (_, record) => (record.rating != null ? `⭐ ${record.rating}` : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <AppButton
          variant="secondary"
          size="xs"
          onClick={() =>
            record.status === 'pending'
              ? navigate(ROUTES.APPROVALS)
              : navigate(`/guides/${record.id}`)
          }
        >
          {record.status === 'pending' ? 'Review' : 'View'}
        </AppButton>
      ),
    },
  ];

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Guides', onClick: () => navigate(ROUTES.GUIDES) },
          { label: 'Guide Roster' },
        ]}
      />

      <PageHeader
        title="Guide Roster"
        subtitle={`${guides.length} total · ${activeCount} active · ${pendingCount} pending · ${inactiveCount} inactive`}
        extra={
          <>
            <AppButton variant="secondary" size="xs" onClick={() => showToast('Export started')}>
              Export CSV
            </AppButton>
            <AppButton size="xs">+ Invite Guide</AppButton>
          </>
        }
      />

      {status === 'loading' && guides.length === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      {status === 'failed' && (
        <ListErrorState
          message={error}
          loading={false}
          onRetry={() => void dispatch(fetchAdminGuides({}))}
        />
      )}

      {status !== 'failed' && (
        <>
          <FilterBar>
            <SearchInput
              placeholder="Search guides…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <FilterSelect
              value={languageFilter}
              onChange={(e) => {
                setLanguageFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Languages' },
                { value: 'EN', label: 'English' },
                { value: 'IT', label: 'Italian' },
                { value: 'FR', label: 'French' },
                { value: 'ES', label: 'Spanish' },
                { value: 'DE', label: 'German' },
                { value: 'JA', label: 'Japanese' },
              ]}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
          </FilterBar>

          <BulkActionBar selectedCount={selectedKeys.length}>
            <AppButton variant="secondary" size="xs">
              Activate
            </AppButton>
            <AppButton variant="danger" size="xs">
              Remove
            </AppButton>
          </BulkActionBar>

          <DataTable<Guide>
            rowKey="id"
            columns={columns}
            dataSource={pageData}
            pagination={false}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys as string[]),
            }}
          />

          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filteredGuides.length}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
