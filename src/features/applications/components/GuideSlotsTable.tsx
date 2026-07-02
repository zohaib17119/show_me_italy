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

export interface GuideSlotsTableProps {
  rows: GuideSlotRow[];
  loading?: boolean;
  showSearch?: boolean;
}

export function GuideSlotsTable({
  rows,
  loading = false,
  showSearch = true,
}: GuideSlotsTableProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === '') return rows;
    return rows.filter(
      (slot) =>
        slot.tourName.toLowerCase().includes(query) ||
        slot.dateLabel.toLowerCase().includes(query) ||
        slot.language.toLowerCase().includes(query),
    );
  }, [rows, search]);

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
      { title: 'Start Time', dataIndex: 'startTime', key: 'startTime' },
      { title: 'Entrance Time', dataIndex: 'entranceTime', key: 'entranceTime' },
      {
        title: 'Language',
        dataIndex: 'language',
        key: 'language',
        render: (lang: GuideSlotRow['language']) => <LangChip code={lang} />,
      },
      { title: 'Guide Name', dataIndex: 'guideName', key: 'guideName' },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 100,
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
        scroll={{ x: 'max-content' }}
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
