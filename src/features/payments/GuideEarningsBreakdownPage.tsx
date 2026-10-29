import { useCallback, useEffect, useMemo, useState } from 'react';
import { Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '@/api/axiosInstance';
import {
  mapGuideEarningsDetailRecords,
  type GuideEarningsDetailRow,
} from '@/api/mappers/guideEarningsMapper';
import { formatLocalDateKey, todayLocalDateKey } from '@/api/utils/date';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AppButton,
  BreadcrumbNav,
  DataTable,
  FilterBar,
  FormInput,
  ListErrorState,
  showToast,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { earningsApi } from '@/features/payments/earningsApi';
import {
  fetchLanguages,
  selectLanguages,
} from '@/features/language/languageSlice';

interface BreakdownLocationState {
  guideName?: string;
}

function subtractOneMonth(dateYmd: string): string {
  const [y, m, d] = dateYmd.split('-').map(Number);
  const date = new Date(y, m - 2, d);
  return formatLocalDateKey(date.getFullYear(), date.getMonth(), date.getDate());
}

function isYmd(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function formatEuro(value: number): string {
  return `€${value.toLocaleString('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function GuideEarningsBreakdownPage() {
  const { guideId: guideIdParam } = useParams<{ guideId: string }>();
  const guideId = guideIdParam ? decodeURIComponent(guideIdParam).trim() : '';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const languages = useAppSelector(selectLanguages);
  const stateGuideName = (location.state as BreakdownLocationState | null)?.guideName;
  const today = todayLocalDateKey();

  const [fromDate, setFromDate] = useState(() =>
    isYmd(searchParams.get('fromDate')) ? searchParams.get('fromDate')! : subtractOneMonth(today),
  );
  const [toDate, setToDate] = useState(() =>
    isYmd(searchParams.get('toDate')) ? searchParams.get('toDate')! : today,
  );
  const [rows, setRows] = useState<GuideEarningsDetailRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const languageLabelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const lang of languages) {
      if (lang.languageId == null) continue;
      const label = lang.name?.trim() || lang.code?.trim() || '';
      if (label) map.set(lang.languageId, label);
    }
    return map;
  }, [languages]);

  const applyDateRange = useCallback(
    (nextFrom: string, nextTo: string) => {
      setFromDate(nextFrom);
      setToDate(nextTo);
      setSearchParams({ fromDate: nextFrom, toDate: nextTo }, { replace: true });
    },
    [setSearchParams],
  );

  const loadDetail = useCallback(async () => {
    if (!guideId) {
      setRows([]);
      setStatus('failed');
      setError('Missing guide id');
      return;
    }
    setStatus('loading');
    setError(null);
    try {
      const records = await earningsApi.getGuideEarningsDetail({
        guideId,
        fromDate,
        toDate,
      });
      setRows(mapGuideEarningsDetailRecords(records));
      setStatus('succeeded');
    } catch (err) {
      setRows([]);
      setStatus('failed');
      setError(getApiErrorMessage(err));
      showToast('Failed to load earnings breakdown');
    }
  }, [guideId, fromDate, toDate]);

  useEffect(() => {
    void dispatch(fetchLanguages());
  }, [dispatch]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const titleGuideName =
    stateGuideName?.trim() || rows[0]?.guideName?.trim() || 'Guide';

  const columns: ColumnsType<GuideEarningsDetailRow> = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'slotDateLabel',
        key: 'slotDate',
      },
      {
        title: 'Tour type',
        dataIndex: 'tourTypeName',
        key: 'tourTypeName',
      },
      {
        title: 'Language',
        key: 'language',
        render: (_, row) =>
          row.languageId != null
            ? languageLabelById.get(row.languageId) ?? '—'
            : '—',
      },
      {
        title: 'Hours',
        key: 'hours',
        render: (_, row) =>
          Number.isInteger(row.hours) ? String(row.hours) : row.hours.toFixed(1),
      },
      {
        title: 'Duration (min)',
        dataIndex: 'durationMinutes',
        key: 'durationMinutes',
      },
      {
        title: 'Earning',
        key: 'earning',
        render: (_, row) => <strong>{formatEuro(row.earning)}</strong>,
      },
      {
        title: 'Application ID',
        key: 'applicationId',
        render: (_, row) =>
          row.applicationId != null ? String(row.applicationId) : '—',
      },
      {
        title: 'Tour slot ID',
        key: 'tourSlotId',
        render: (_, row) => (row.tourSlotId != null ? String(row.tourSlotId) : '—'),
      },
    ],
    [languageLabelById],
  );

  const backToPayments = () => navigate(ROUTES.REPORTS);

  return (
    <div>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate(ROUTES.DASHBOARD) },
          { label: 'Payment Reports', onClick: backToPayments },
          { label: 'Breakdown' },
        ]}
      />

      <PageHeader
        title={titleGuideName}
        subtitle="Earnings breakdown"
        extra={
          <AppButton variant="secondary" onClick={backToPayments}>
            Back to payments
          </AppButton>
        }
      />

      <FilterBar>
        <FormInput
          label="From"
          type="date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => {
            applyDateRange(e.target.value || subtractOneMonth(todayLocalDateKey()), toDate);
          }}
        />
        <FormInput
          label="To"
          type="date"
          value={toDate}
          min={fromDate || undefined}
          max={todayLocalDateKey()}
          onChange={(e) => {
            applyDateRange(fromDate, e.target.value || todayLocalDateKey());
          }}
        />
      </FilterBar>

      {status === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      )}

      {status === 'failed' && (
        <ListErrorState message={error} onRetry={() => void loadDetail()} />
      )}

      {status === 'succeeded' && (
        <DataTable<GuideEarningsDetailRow>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'No earnings detail for this guide' }}
        />
      )}
    </div>
  );
}
