import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
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
  SearchInput,
  StatusBadge,
  TablePagination,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { MOCK_GUIDES, type Guide, type GuideStatus } from '@/mocks';
import type { TourStatus } from '@/types';

const PAGE_SIZE = 5;

function guideStatusToBadge(status: GuideStatus): TourStatus {
  if (status === 'active') return 'approved';
  if (status === 'pending') return 'pending';
  return 'denied';
}

export function GuideRosterPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    'guide-marco-rossi',
    'guide-sofia-conti',
    'guide-hans-muller',
  ]);

  const filteredGuides = useMemo(() => {
    return MOCK_GUIDES.filter((guide) => {
      const matchesSearch =
        search.trim() === '' ||
        guide.name.toLowerCase().includes(search.toLowerCase()) ||
        guide.email.toLowerCase().includes(search.toLowerCase());
      const matchesLang =
        languageFilter === 'all' || guide.languages.includes(languageFilter as Guide['languages'][0]);
      const matchesStatus = statusFilter === 'all' || guide.status === statusFilter;
      return matchesSearch && matchesLang && matchesStatus;
    });
  }, [search, languageFilter, statusFilter]);

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
        subtitle="48 total · 44 active · 3 pending · 1 inactive"
        extra={
          <>
            <AppButton variant="secondary" size="xs">
              Export CSV
            </AppButton>
            <AppButton size="xs">+ Invite Guide</AppButton>
          </>
        }
      />

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
    </div>
  );
}
