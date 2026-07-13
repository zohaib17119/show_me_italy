import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getApiErrorMessage } from '@/api/axiosInstance';
import {
  mapPendingTourSlots,
  type PendingTourSlotRow,
} from '@/api/mappers/pendingTourSlotMapper';
import { formatDisplayDate } from '@/api/utils/date';
import {
  AppButton,
  DataTable,
  LangChip,
  ListErrorState,
  StatusBadge,
} from '@/components/ui';
import { getAssignmentPath } from '@/constants/routes';
import { applicationsApi } from '@/features/applications/applicationsApi';
import type { LangCode } from '@/types';
import { SlotApplicantsDrawer } from './SlotApplicantsDrawer';

export interface AssignmentSlotNavState {
  tourSlotId: number;
  tourName: string;
  dateLabel: string;
  dateKey: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  language: string;
  payRatePerHour: number | null;
  payRateLabel: string;
}

export interface ApplicationsDaySlotsDrawerProps {
  open: boolean;
  dateKey: string | null;
  onClose: () => void;
  onMutated?: () => void;
}

function ApplicantBadges({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>None</span>;
  }

  const visible = names.slice(0, 2);
  const remaining = names.length - visible.length;

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
      {visible.map((name, index) => (
        <span
          key={`${name}-${index}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--g100)',
            color: 'var(--g700)',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {name}
        </span>
      ))}
      {remaining > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: 999,
            background: 'var(--orange-bg)',
            color: 'var(--orange)',
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
}

export function ApplicationsDaySlotsDrawer({
  open,
  dateKey,
  onClose,
  onMutated,
}: ApplicationsDaySlotsDrawerProps) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<PendingTourSlotRow[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<{
    tourSlotId: number;
    dateKey: string;
    languageCode: string;
  } | null>(null);

  const loadSlots = useCallback(async () => {
    if (!dateKey) return;
    setStatus('loading');
    setError(null);
    try {
      const records = await applicationsApi.getPendingTourSlotsByDate(dateKey);
      setRows(mapPendingTourSlots(records));
      setStatus('succeeded');
    } catch (err) {
      setStatus('failed');
      setError(getApiErrorMessage(err));
      setRows([]);
    }
  }, [dateKey]);

  useEffect(() => {
    if (open && dateKey) {
      void loadSlots();
    } else if (!open) {
      setRows([]);
      setStatus('idle');
      setError(null);
      setAssignTarget(null);
    }
  }, [open, dateKey, loadSlots]);

  const handleNestedMutated = useCallback(() => {
    void loadSlots();
    onMutated?.();
  }, [loadSlots, onMutated]);

  const handleAssignClick = useCallback(
    (row: PendingTourSlotRow) => {
      if (row.applicantNames.length === 0) {
        const navState: AssignmentSlotNavState = {
          tourSlotId: row.tourSlotId,
          tourName: row.tourTypeName,
          dateLabel: row.slotDateKey ? formatDisplayDate(row.slotDateKey) : '—',
          dateKey: row.slotDateKey || dateKey || '',
          startTime: row.startTime,
          endTime: row.endTime,
          timeRange: row.timeRange,
          language: row.languageLabel || String(row.languageCode),
          payRatePerHour: row.payRatePerHour,
          payRateLabel: row.payRate,
        };
        onClose();
        navigate(getAssignmentPath(row.tourSlotId), { state: navState });
        return;
      }

      setAssignTarget({
        tourSlotId: row.tourSlotId,
        dateKey: row.slotDateKey || dateKey || '',
        languageCode:
          row.languageCode && row.languageCode !== '—' ? String(row.languageCode) : '',
      });
    },
    [dateKey, navigate, onClose],
  );

  const withApplicants = useMemo(
    () => rows.filter((row) => row.applicantNames.length > 0),
    [rows],
  );
  const missingApplicants = useMemo(
    () => rows.filter((row) => row.applicantNames.length === 0),
    [rows],
  );

  const columns: ColumnsType<PendingTourSlotRow> = useMemo(
    () => [
      {
        title: 'Tour',
        dataIndex: 'tourTypeName',
        key: 'tourTypeName',
        width: 180,
      },
      {
        title: 'Tour Code',
        dataIndex: 'tourCode',
        key: 'tourCode',
        width: 100,
      },
      {
        title: 'Time',
        dataIndex: 'timeRange',
        key: 'timeRange',
        width: 110,
      },
      {
        title: 'Language',
        key: 'language',
        width: 90,
        render: (_, row) =>
          row.languageCode && row.languageCode !== '—' ? (
            <LangChip code={row.languageCode as LangCode} />
          ) : (
            '—'
          ),
      },
      {
        title: 'Guests',
        dataIndex: 'guestCount',
        key: 'guestCount',
        width: 70,
      },
      {
        title: 'Pay',
        dataIndex: 'payRate',
        key: 'payRate',
        width: 80,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (s: PendingTourSlotRow['status']) => <StatusBadge status={s} />,
      },
      {
        title: 'Applicants',
        key: 'applicants',
        width: 180,
        render: (_, row) => <ApplicantBadges names={row.applicantNames} />,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        fixed: 'right',
        render: (_, row) => (
          <AppButton size="xs" onClick={() => handleAssignClick(row)}>
            Assign
          </AppButton>
        ),
      },
    ],
    [handleAssignClick],
  );

  const title = dateKey
    ? `Pending Slots — ${formatDisplayDate(dateKey)}`
    : 'Pending Slots';

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={title}
        placement="right"
        width={960}
        destroyOnClose
      >
        {status === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin />
          </div>
        )}

        {status === 'failed' && (
          <ListErrorState message={error} onRetry={() => void loadSlots()} />
        )}

        {status === 'succeeded' &&
          withApplicants.length === 0 &&
          missingApplicants.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 4px' }}>
              No pending tour slots for {dateKey ? formatDisplayDate(dateKey) : 'this date'}.
            </div>
          )}

        {status === 'succeeded' &&
          (withApplicants.length > 0 || missingApplicants.length > 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <section>
                <h3
                  style={{
                    margin: '0 0 10px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  Slots with applicant
                </h3>
                {withApplicants.length > 0 ? (
                  <DataTable<PendingTourSlotRow>
                    rowKey="id"
                    columns={columns}
                    dataSource={withApplicants}
                    pagination={false}
                    size="small"
                    scroll={{ x: 'max-content' }}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0' }}>
                    No slots with applicants.
                  </div>
                )}
              </section>

              <section>
                <h3
                  style={{
                    margin: '0 0 10px',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  Missing applicants slots
                </h3>
                {missingApplicants.length > 0 ? (
                  <DataTable<PendingTourSlotRow>
                    rowKey="id"
                    columns={columns}
                    dataSource={missingApplicants}
                    pagination={false}
                    size="small"
                    scroll={{ x: 'max-content' }}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0' }}>
                    No slots missing applicants.
                  </div>
                )}
              </section>
            </div>
          )}
      </Drawer>

      <SlotApplicantsDrawer
        open={assignTarget != null}
        tourSlotId={assignTarget?.tourSlotId ?? null}
        dateKey={assignTarget?.dateKey ?? null}
        languageCode={assignTarget?.languageCode ?? null}
        onClose={() => setAssignTarget(null)}
        onMutated={handleNestedMutated}
      />
    </>
  );
}
