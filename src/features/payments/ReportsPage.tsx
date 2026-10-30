import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { mapGuideEarningsRecords, type GuideEarningsRow } from '@/api/mappers/guideEarningsMapper';
import { formatLocalDateKey, todayLocalDateKey } from '@/api/utils/date';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  DataTable,
  FilterBar,
  FormInput,
  FormSelect,
  GuideCell,
  LoadingOverlay,
  TablePagination,
  showToast,
} from '@/components/ui';
import { getRouteMeta } from '@/constants/navigation';
import { ROUTES, getReportsBreakdownPath } from '@/constants/routes';
import { agentApi } from '@/features/agent/agentApi';
import { earningsApi } from '@/features/payments/earningsApi';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

function subtractOneMonth(dateYmd: string): string {
  const [y, m, d] = dateYmd.split('-').map(Number);
  const date = new Date(y, m - 2, d);
  return formatLocalDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatEuro(value: number): string {
  return `€${value.toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function inferTotal(page: number, pageSize: number, rowCount: number): number {
  if (rowCount < pageSize) {
    return (page - 1) * pageSize + rowCount;
  }
  return page * pageSize + 1;
}

export function ReportsPage() {
  const navigate = useNavigate();
  const meta = getRouteMeta(ROUTES.REPORTS);
  const today = todayLocalDateKey();

  const [guideId, setGuideId] = useState('');
  const [fromDate, setFromDate] = useState(() => subtractOneMonth(today));
  const [toDate, setToDate] = useState(today);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [rows, setRows] = useState<GuideEarningsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [guideOptions, setGuideOptions] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'All guides' },
  ]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const agents = await agentApi.getAllAgentsAdmin({});
        if (cancelled) return;
        const options = agents
          .map((agent) => {
            const id = String(agent.userId ?? agent.id ?? '').trim();
            if (!id) return null;
            const name = agent.fullName?.trim() || 'Unknown';
            return { value: id, label: name };
          })
          .filter((opt): opt is { value: string; label: string } => opt != null)
          .sort((a, b) => a.label.localeCompare(b.label));
        setGuideOptions([{ value: '', label: 'All guides' }, ...options]);
      } catch {
        if (!cancelled) {
          showToast('Failed to load guides');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const records = await earningsApi.getGuideEarnings({
        guideId: guideId || undefined,
        fromDate,
        toDate,
        pagenumber: page,
        pagesize: pageSize,
      });
      setRows(mapGuideEarningsRecords(records));
    } catch {
      setRows([]);
      showToast('Failed to load guide earnings');
    } finally {
      setLoading(false);
    }
  }, [guideId, fromDate, toDate, page, pageSize]);

  useEffect(() => {
    void loadEarnings();
  }, [loadEarnings]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await earningsApi.exportGuideEarnings({
        fromDate,
        toDate,
        guideId: guideId || undefined,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to export guide earnings');
    } finally {
      setExporting(false);
    }
  };

  const total = useMemo(
    () => inferTotal(page, pageSize, rows.length),
    [page, pageSize, rows.length],
  );

  const columns: ColumnsType<GuideEarningsRow> = useMemo(
    () => [
      {
        title: 'Guide',
        key: 'guide',
        render: (_, row) => (
          <GuideCell
            initials={row.guideInitials}
            name={row.guideName}
            sub={row.email}
          />
        ),
      },
      {
        title: 'Tours',
        dataIndex: 'totalTours',
        key: 'totalTours',
      },
      {
        title: 'Total Earnings',
        key: 'totalEarnings',
        render: (_, row) => <strong>{formatEuro(row.totalEarnings)}</strong>,
      },
      {
        title: 'Avg Pay',
        key: 'averagePayRate',
        render: (_, row) => formatEuro(row.averagePayRate),
      },
      {
        title: 'Min Pay',
        key: 'minimumPayRate',
        render: (_, row) => formatEuro(row.minimumPayRate),
      },
      {
        title: 'Max Pay',
        key: 'maximumPayRate',
        render: (_, row) => formatEuro(row.maximumPayRate),
      },
      {
        title: 'Hours',
        dataIndex: 'totalHours',
        key: 'totalHours',
        render: (hours: number) =>
          Number.isInteger(hours) ? String(hours) : hours.toFixed(1),
      },
      {
        title: 'Avg Hourly',
        key: 'averageHourlyEarning',
        render: (_, row) => formatEuro(row.averageHourlyEarning),
      },
      {
        title: 'Languages',
        dataIndex: 'languagesWorked',
        key: 'languagesWorked',
      },
      {
        title: 'Tour Types',
        dataIndex: 'tourTypesWorked',
        key: 'tourTypesWorked',
      },
      {
        title: 'First Tour',
        dataIndex: 'firstTourDateLabel',
        key: 'firstTourDate',
      },
      {
        title: 'Last Tour',
        dataIndex: 'lastTourDateLabel',
        key: 'lastTourDate',
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 140,
        render: (_, row) => (
          <AppButton
            variant="secondary"
            size="sm"
            onClick={() =>
              navigate(getReportsBreakdownPath(row.guideId, { fromDate, toDate }), {
                state: { guideName: row.guideName },
              })
            }
          >
            Breakdown
          </AppButton>
        ),
      },
    ],
    [navigate, fromDate, toDate],
  );

  return (
    <div>
      <LoadingOverlay visible={loading} />
      <PageHeader title={meta.title} subtitle={meta.subtitle} />

      <FilterBar>
        <FormSelect
          label="Guide"
          value={guideId}
          options={guideOptions}
          onChange={(e) => {
            setGuideId(e.target.value);
            setPage(1);
          }}
        />
        <FormInput
          label="From"
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => {
            setFromDate(e.target.value || subtractOneMonth(todayLocalDateKey()));
            setPage(1);
          }}
        />
        <FormInput
          label="To"
          type="date"
          value={toDate}
          min={fromDate || undefined}
          max={todayLocalDateKey()}
          onChange={(e) => {
            setToDate(e.target.value || todayLocalDateKey());
            setPage(1);
          }}
        />
        <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          <AppButton
            variant="secondary"
            onClick={() => void handleExportCsv()}
            disabled={exporting || loading}
          >
            {exporting ? 'Exporting…' : 'Export to CSV'}
          </AppButton>
        </div>
      </FilterBar>

      <DataTable<GuideEarningsRow>
        rowKey="guideId"
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />

      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
