import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { AllAgentsAdminFilter } from '@/api/types';
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
  LoadingOverlay,
  LockedAction,
  SearchInput,
  StatusBadge,
  TablePagination,
} from '@/components/ui';
import { useCan } from '@/features/auth/useCan';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { ROUTES } from '@/constants/routes';
import {
  fetchAdminGuides,
  selectAdminGuideError,
  selectAdminGuideStatus,
  selectAdminGuides,
} from '@/features/agent/agentSlice';
import { fetchLanguages, selectActiveLanguages } from '@/features/language/languageSlice';
import type { Guide, GuideStatus } from '@/mocks/guides';
import type { TourStatus } from '@/types';
import { UpdateGuideModal } from './components/UpdateGuideModal';

function formatRating(rating: number | null): string {
  if (rating == null) return '—';
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

function guideStatusToBadge(status: GuideStatus): TourStatus {
  if (status === 'active') return 'active';
  if (status === 'pending') return 'pending';
  return 'inactive';
}

const CATEGORY_CHIP_STYLE: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  padding: '2px 8px',
  borderRadius: 999,
  background: 'var(--g50)',
  color: 'var(--text-primary)',
  whiteSpace: 'nowrap',
};

const CATEGORY_OVERFLOW_STYLE: CSSProperties = {
  ...CATEGORY_CHIP_STYLE,
  cursor: 'default',
  background: 'var(--g100, #e8e8e8)',
};

function parseCategoryLabels(categories?: string): string[] {
  return (categories ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function GuideCategoryChips({ categories }: { categories?: string }) {
  const labels = parseCategoryLabels(categories);
  if (labels.length === 0) {
    return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  }

  const visible = labels.slice(0, 2);
  const extra = labels.slice(2);

  return (
    <span style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', alignItems: 'center' }}>
      {visible.map((label, index) => (
        <span key={`${label}-${index}`} style={CATEGORY_CHIP_STYLE}>
          {label}
        </span>
      ))}
      {extra.length > 0 ? (
        <Tooltip
          title={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {extra.map((label, index) => (
                <span key={`${label}-extra-${index}`}>{label}</span>
              ))}
            </div>
          }
        >
          <span style={CATEGORY_OVERFLOW_STYLE}>+{extra.length}</span>
        </Tooltip>
      ) : null}
    </span>
  );
}

export function GuideRosterPage() {
  const navigate = useNavigate();
  const can = useCan();
  const canEdit = can('Guides.Edit');
  const canActivate = can('Guides.Activate');
  const dispatch = useAppDispatch();
  const guides = useAppSelector(selectAdminGuides);
  const status = useAppSelector(selectAdminGuideStatus);
  const error = useAppSelector(selectAdminGuideError);
  const languages = useAppSelector(selectActiveLanguages);

  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [editGuide, setEditGuide] = useState<Guide | null>(null);

  const apiFilter = useMemo((): AllAgentsAdminFilter => {
    const filter: AllAgentsAdminFilter = {};
    if (languageFilter !== 'all') filter.language = languageFilter;
    if (statusFilter === 'active') filter.isActive = true;
    else if (statusFilter === 'inactive') filter.isActive = false;
    return filter;
  }, [languageFilter, statusFilter]);

  const languageOptions = useMemo(
    () => [
      { value: 'all', label: 'All Languages' },
      ...languages
        .filter((l) => l.code)
        .map((l) => ({
          value: l.code!.toUpperCase(),
          label: l.name ?? l.code!,
        })),
    ],
    [languages],
  );

  const loadGuides = useCallback(() => {
    void dispatch(fetchAdminGuides(apiFilter));
  }, [dispatch, apiFilter]);

  useFetchErrorToast(status, error);

  useEffect(() => {
    void dispatch(fetchLanguages());
  }, [dispatch]);

  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

  const activeCount = guides.filter((g) => g.isActive === true).length;
  const inactiveCount = guides.filter((g) => g.isActive === false).length;

  const filteredGuides = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === '') return guides;
    return guides.filter(
      (guide) =>
        guide.name.toLowerCase().includes(query) ||
        guide.email.toLowerCase().includes(query),
    );
  }, [guides, search]);

  const pageData = filteredGuides.slice((page - 1) * pageSize, page * pageSize);

  const columns: ColumnsType<Guide> = [
    {
      title: 'Guide',
      key: 'guide',
      render: (_, record) => (
        <GuideCell
          initials={record.initials}
          name={record.name}
          favorite={record.favorite}
          sub={record.email}
          profilePicture={record.profilePicture}
          pendingCount={record.pendingCounts}
        />
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
      title: 'Categories',
      key: 'categories',
      render: (_, record) => <GuideCategoryChips categories={record.categories} />,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <StatusBadge status={guideStatusToBadge(record.isActive ? 'active' : 'inactive')} />
      ),
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
      title: 'Admin Notes',
      key: 'adminNotes',
      render: (_, record) =>
        record.adminNotes?.trim() ? (
          <span>{record.adminNotes}</span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        ),
    },
    {
      title: 'Rating',
      key: 'rating',
      render: (_, record) =>
        record.rating != null ? `⭐ ${formatRating(record.rating)}` : '—',
    },
    {
      title: 'Cancellation %',
      key: 'cancellationPercentage',
      render: (_, record) =>
        record.cancellationPercentage != null ? `${record.cancellationPercentage}%` : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <LockedAction allowed={canEdit}>
            <AppButton variant="secondary" size="xs" onClick={() => setEditGuide(record)}>
              Edit
            </AppButton>
          </LockedAction>
          <AppButton
            variant="primary"
            size="xs"
            onClick={() =>
              record.status === 'pending'
                ? navigate(ROUTES.APPROVALS)
                : navigate(`/guides/${record.id}`)
            }
          >
            {record.status === 'pending' ? 'Review' : 'View'}
          </AppButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <LoadingOverlay visible={status === 'loading'} />
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Guides', onClick: () => navigate(ROUTES.GUIDES) },
          { label: 'Guide Roster' },
        ]}
      />

      <PageHeader
        title="Guide Roster"
        subtitle={`${guides.length} total · ${activeCount} active · ${inactiveCount} inactive`}
        extra={<></>}
      />

      {status === 'failed' && (
        <ListErrorState message={error} loading={false} onRetry={loadGuides} />
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
              options={languageOptions}
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
              ]}
            />
          </FilterBar>

          <BulkActionBar selectedCount={selectedKeys.length}>
            <LockedAction allowed={canActivate}>
              <AppButton variant="secondary" size="xs">
                Activate
              </AppButton>
            </LockedAction>
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
            pageSize={pageSize}
            total={filteredGuides.length}
            pageSizeOptions={[25, 50, 100]}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </>
      )}

      <UpdateGuideModal
        open={editGuide != null}
        guide={editGuide}
        onClose={() => setEditGuide(null)}
        onUpdated={loadGuides}
      />
    </div>
  );
}
