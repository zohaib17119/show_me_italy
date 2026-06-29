import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PageHeader } from '@/components/layout/PageHeader';
import type { GuideSlotRow } from '@/api/mappers/guideSlotMapper';
import {
  AppButton,
  DataTable,
  FilterBar,
  LangChip,
  ListErrorState,
  LoadingOverlay,
  SearchInput,
  TablePagination,
} from '@/components/ui';
import { useFetchErrorToast } from '@/hooks/useFetchErrorToast';
import { getRouteMeta } from '@/constants/navigation';
import { getAssignmentPath, ROUTES } from '@/constants/routes';
import {
  fetchGuideSlots,
  selectGuideSlots,
  selectGuideSlotsError,
  selectGuideSlotsStatus,
} from '@/features/applications/applicationsSlice';

const PAGE_SIZE = 10;

export function GuideSlotsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const meta = getRouteMeta(ROUTES.GUIDE_SLOTS);
  const guideSlots = useAppSelector(selectGuideSlots);
  const status = useAppSelector(selectGuideSlotsStatus);
  const error = useAppSelector(selectGuideSlotsError);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const loadGuideSlots = useCallback(() => {
    void dispatch(fetchGuideSlots());
  }, [dispatch]);

  useFetchErrorToast(status, error);

  useEffect(() => {
    loadGuideSlots();
  }, [loadGuideSlots]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === '') return guideSlots;
    return guideSlots.filter(
      (slot) =>
        slot.tourName.toLowerCase().includes(query) ||
        slot.dateLabel.toLowerCase().includes(query) ||
        slot.language.toLowerCase().includes(query),
    );
  }, [guideSlots, search]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnsType<GuideSlotRow> = useMemo(
    () => [
      { title: 'Tour', dataIndex: 'tourName', key: 'tour' },
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
        render: (lang: GuideSlotRow['language']) => <LangChip code={lang} />,
      },
      {
        title: 'Needed / Applied',
        dataIndex: 'applicantsLabel',
        key: 'applicantsLabel',
        render: (label: string, row) => (
          <strong title={`${row.guidesNeeded} needed · ${row.totalApplicants} applied`}>
            {label}
          </strong>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, row) => (
          <AppButton
            variant="primary"
            size="xs"
            onClick={() =>
              navigate(getAssignmentPath(row.tourSlotId), { state: row })
            }
          >
            Assign
          </AppButton>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={status === 'loading' && guideSlots.length === 0} />

      <PageHeader
        title={meta.title}
        subtitle={`${guideSlots.length} slot${guideSlots.length === 1 ? '' : 's'} with applications`}
      />

      {status === 'failed' && (
        <ListErrorState message={error} onRetry={loadGuideSlots} />
      )}

      {status !== 'failed' && (
        <>
          <FilterBar>
            <SearchInput
              placeholder="Search tour, date, language…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </FilterBar>

          <DataTable<GuideSlotRow>
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
