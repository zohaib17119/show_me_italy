import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  AppButton,
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
import type { Application } from '@/mocks/applications';
import {
  buildGroupedQueueRows,
  isQueueGroupRow,
  type QueueTableRow,
} from './queueTableRows';

const PAGE_SIZE = 10;

export interface ApplicationsQueueTableProps {
  rows: Application[];
  loading?: boolean;
  showSearch?: boolean;
  showPayRate?: boolean;
  showGuideNotes?: boolean;
  groupByTourSlot?: boolean;
  approvingId?: number | null;
  holdingId?: number | null;
  mutationLoading?: boolean;
  onApprove: (applicationId: number) => void | Promise<void>;
  onHold?: (applicationId: number) => void | Promise<void>;
}

export function ApplicationsQueueTable({
  rows,
  loading = false,
  showSearch = false,
  showPayRate = false,
  showGuideNotes = false,
  groupByTourSlot = false,
  approvingId = null,
  holdingId = null,
  mutationLoading = false,
  onApprove,
  onHold,
}: ApplicationsQueueTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!showSearch) return rows;
    const query = search.trim().toLowerCase();
    if (query === '') return rows;
    return rows.filter(
      (app) =>
        app.guideName.toLowerCase().includes(query) ||
        app.tour.toLowerCase().includes(query),
    );
  }, [rows, search, showSearch]);

  const tableRows = useMemo((): QueueTableRow[] => {
    if (groupByTourSlot) {
      return buildGroupedQueueRows(filtered);
    }
    return filtered.map((row) => ({ rowType: 'application' as const, ...row }));
  }, [filtered, groupByTourSlot]);

  const pageData = groupByTourSlot
    ? tableRows
    : tableRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columnCount = 8 + (showPayRate ? 1 : 0) + (showGuideNotes ? 1 : 0);

  const groupCell = (record: QueueTableRow) =>
    isQueueGroupRow(record) ? { colSpan: 0 } : {};

  const columns: ColumnsType<QueueTableRow> = useMemo(
    () => {
      const cols: ColumnsType<QueueTableRow> = [
      {
        title: 'Guide',
        key: 'guide',
        onCell: (record) =>
          isQueueGroupRow(record) ? { colSpan: columnCount } : {},
        render: (_, row) =>
          isQueueGroupRow(row) ? (
            <strong style={{ fontSize: 13 }}>{row.typeName}</strong>
          ) : (
            <GuideCell initials={row.guideInitials} name={row.guideName} />
          ),
      },
      {
        title: 'Tour',
        key: 'tour',
        onCell: groupCell,
        render: (_, row) => (isQueueGroupRow(row) ? null : row.tour),
      },
      {
        title: 'Date',
        key: 'date',
        onCell: groupCell,
        render: (_, row) =>
          isQueueGroupRow(row) ? null : <strong>{row.dateLabel}</strong>,
      },
      {
        title: 'Time',
        key: 'time',
        onCell: groupCell,
        render: (_, row) => (isQueueGroupRow(row) ? null : row.time),
      },
      {
        title: 'Language',
        key: 'language',
        onCell: groupCell,
        render: (_, row) =>
          isQueueGroupRow(row) ? null : <LangChip code={row.language} />,
      },
      ];

      if (showPayRate) {
        cols.push({
          title: 'Pay Rate',
          key: 'payRate',
          onCell: groupCell,
          render: (_, row) =>
            isQueueGroupRow(row) ? null : <strong>{row.payRate}</strong>,
        });
      }

      if (showGuideNotes) {
        cols.push({
          title: 'Guide Notes',
          key: 'adminNotes',
          onCell: groupCell,
          render: (_, row) =>
            isQueueGroupRow(row) ? null : (
              <span>{row.adminNotes?.trim() ? row.adminNotes : '—'}</span>
            ),
        });
      }

      cols.push(
      {
        title: 'Applied At',
        key: 'appliedAt',
        onCell: groupCell,
        render: (_, row) =>
          isQueueGroupRow(row) ? null : (
            <span style={{ color: 'var(--text-muted)' }}>{row.appliedAt}</span>
          ),
      },
      {
        title: 'Status',
        key: 'status',
        onCell: groupCell,
        render: (_, row) =>
          isQueueGroupRow(row) ? null : <StatusBadge status={row.status} />,
      },
      {
        title: 'Actions',
        key: 'actions',
        onCell: groupCell,
        render: (_, row) =>
          isQueueGroupRow(row) ? null : (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <AppButton
                variant="primary"
                size="xs"
                disabled={
                  mutationLoading &&
                  (approvingId === row.applicationId || holdingId === row.applicationId)
                }
                onClick={() => void onApprove(row.applicationId)}
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
              {onHold && (
                <AppButton
                  variant="secondary"
                  size="xs"
                  disabled={
                    mutationLoading &&
                    (holdingId === row.applicationId || approvingId === row.applicationId)
                  }
                  onClick={() => void onHold(row.applicationId)}
                >
                  Hold
                </AppButton>
              )}
            </div>
          ),
      },
      );

      return cols;
    },
    [approvingId, columnCount, holdingId, mutationLoading, navigate, onApprove, onHold, showGuideNotes, showPayRate],
  );

  return (
    <>
      {showSearch && (
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
      )}

      <DataTable<QueueTableRow>
        rowKey={(row) => (isQueueGroupRow(row) ? row.key : row.id)}
        columns={columns}
        dataSource={pageData}
        loading={loading}
        pagination={false}
        footer={
          groupByTourSlot
            ? undefined
            : () => (
                <TablePagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  onPageChange={setPage}
                />
              )
        }
      />
    </>
  );
}
