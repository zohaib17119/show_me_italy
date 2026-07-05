import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { GuideSlotRow } from '@/api/mappers/guideSlotMapper';
import {
  AppButton,
  DataTable,
  FilterBar,
  LangChip,
  SearchInput,
  TablePagination,
} from '@/components/ui';
import { getAssignmentPath } from '@/constants/routes';

const PAGE_SIZE = 10;
const ACTIONS_COL_WIDTH = { default: 300, calendarModal: 180 } as const;

export interface GuideSlotsTableProps {
  rows: GuideSlotRow[];
  loading?: boolean;
  showSearch?: boolean;
  variant?: 'default' | 'calendarModal';
  onUploadTicket?: (row: GuideSlotRow) => void;
  onPreviewTicket?: (row: GuideSlotRow) => void;
}

export function GuideSlotsTable({
  rows,
  loading = false,
  showSearch = true,
  variant = 'default',
  onUploadTicket,
  onPreviewTicket,
}: GuideSlotsTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const isCalendarModal = variant === 'calendarModal';

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === '') return rows;
    return rows.filter(
      (slot) =>
        slot.tourName.toLowerCase().includes(query) ||
        slot.dateLabel.toLowerCase().includes(query) ||
        slot.language.toLowerCase().includes(query) ||
        slot.guideName.toLowerCase().includes(query),
    );
  }, [rows, search]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnsType<GuideSlotRow> = useMemo(() => {
    const base: ColumnsType<GuideSlotRow> = [
      { title: 'Tour', dataIndex: 'tourName', key: 'tour' },
      {
        title: 'Date',
        dataIndex: 'dateLabel',
        key: 'date',
        render: (label: string) => <strong>{label}</strong>,
      },
      {
        title: 'Start Time - End Time',
        dataIndex: 'timeRange',
        key: 'timeRange',
      },
      // { title: 'Entrance Time', dataIndex: 'entranceTime', key: 'entranceTime' },
      {
        title: 'Language',
        dataIndex: 'language',
        key: 'language',
        render: (lang: GuideSlotRow['language']) => <LangChip code={lang} />,
      },
    ];

    if (isCalendarModal) {
      base.push({
        title: 'Total PAX',
        dataIndex: 'totalPax',
        key: 'totalPax',
        render: (value: number) => <strong>{value}</strong>,
      });
    }

    base.push({ title: 'Guide Name', dataIndex: 'guideName', key: 'guideName' });

    base.push({
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: isCalendarModal ? ACTIONS_COL_WIDTH.calendarModal : ACTIONS_COL_WIDTH.default,
      render: (_, row) => {
        const goToAssignment = () =>
          navigate(getAssignmentPath(row.tourSlotId), { state: row });
        const showChangeAssignment = !isCalendarModal && row.hasAssignedGuide;

        if (!row.hasAssignedGuide) {
          return (
            <AppButton variant="primary" size="xs" onClick={goToAssignment}>
              Assign
            </AppButton>
          );
        }

        return (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap', alignItems: 'center' }}>
            {!row.hasTicket ? (
              <AppButton
                variant="warn"
                size="xs"
                onClick={() => onUploadTicket?.(row)}
              >
                Upload Ticket
              </AppButton>
            ) : (
              <AppButton
                variant="primary"
                size="xs"
                onClick={() => onPreviewTicket?.(row)}
              >
                Preview Ticket
              </AppButton>
            )}
            {showChangeAssignment && (
              <AppButton variant="secondary" size="xs" onClick={goToAssignment}>
                Change Assignment
              </AppButton>
            )}
          </div>
        );
      },
    });

    return base;
  }, [isCalendarModal, navigate, onPreviewTicket, onUploadTicket]);

  return (
    <>
      {showSearch && (
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
      )}

      <DataTable<GuideSlotRow>
        rowKey="id"
        columns={columns}
        dataSource={pageData}
        loading={loading}
        pagination={false}
        scroll={{ x: isCalendarModal ? 900 : 960 }}
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
  );
}
