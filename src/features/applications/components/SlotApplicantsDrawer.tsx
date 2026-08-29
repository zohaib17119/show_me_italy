import { useCallback, useEffect, useMemo, useState } from 'react';
import { Drawer, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { mapGuideSlotApplicantsResponse } from '@/api/mappers/guideSlotApplicantsMapper';
import type { SlotApplicantRow } from '@/api/mappers/slotApplicantMapper';
import type { SlotSummaryRow } from '@/api/mappers/slotSummaryMapper';
import {
  AppButton,
  DataTable,
  GuideCell,
  LangChip,
  ListErrorState,
  LockedAction,
  StatusBadge,
  showToast,
} from '@/components/ui';
import { applicationsApi } from '@/features/applications/applicationsApi';
import { useCan } from '@/features/auth/useCan';
import type { LangCode } from '@/types';
import { MoveApplicationModal } from './MoveApplicationModal';

export interface SlotApplicantsDrawerProps {
  open: boolean;
  tourSlotId: number | null;
  dateKey?: string | null;
  languageCode?: string | null;
  onClose: () => void;
  onMutated?: () => void;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export function SlotApplicantsDrawer({
  open,
  tourSlotId,
  dateKey = null,
  languageCode: _languageCode = null,
  onClose,
  onMutated,
}: SlotApplicantsDrawerProps) {
  const can = useCan();
  const canAssign = can('Applications.Assign');
  const [applicants, setApplicants] = useState<SlotApplicantRow[]>([]);
  const [summary, setSummary] = useState<SlotSummaryRow | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [moveApplicationId, setMoveApplicationId] = useState<number | null>(null);

  const moveDate = dateKey?.trim() || summary?.dateKey?.trim() || null;
  const moveLanguageID =
    summary?.languageId != null ? String(summary.languageId) : null;
  const moveTourTypeIds =
    summary?.tourTypeId != null ? String(summary.tourTypeId) : null;
  const moveStatus =
    summary?.statusRaw && summary.statusRaw !== '—' ? summary.statusRaw : null;

  const loadApplicants = useCallback(async () => {
    if (tourSlotId == null || tourSlotId <= 0) return;
    setStatus('loading');
    setError(null);
    try {
      const response = await applicationsApi.getGuideSlotApplicants(tourSlotId);
      const mapped = mapGuideSlotApplicantsResponse(response);
      setSummary(mapped.slotSummary);
      setApplicants(mapped.applicants.filter((row) => row.status === 'pending'));
      setStatus('succeeded');
    } catch (err) {
      setStatus('failed');
      setError(getApiErrorMessage(err));
      setSummary(null);
      setApplicants([]);
    }
  }, [tourSlotId]);

  useEffect(() => {
    if (open && tourSlotId != null && tourSlotId > 0) {
      void loadApplicants();
    } else if (!open) {
      setApplicants([]);
      setSummary(null);
      setStatus('idle');
      setError(null);
      setApprovingId(null);
      setMoveApplicationId(null);
    }
  }, [open, tourSlotId, loadApplicants]);

  const handleApprove = useCallback(
    async (applicationId: number) => {
      setApprovingId(applicationId);
      try {
        await applicationsApi.approveGuideApplication({
          applicationId,
          status: 'Approved',
        });
        showToast('✓ Application approved');
        await loadApplicants();
        onMutated?.();
      } catch (err) {
        showToast(getApiErrorMessage(err));
      } finally {
        setApprovingId(null);
      }
    },
    [loadApplicants, onMutated],
  );

  const columns: ColumnsType<SlotApplicantRow> = useMemo(
    () => [
      {
        title: 'Guide',
        key: 'guide',
        width: 180,
        render: (_, row) => (
          <GuideCell initials={row.guideInitials} name={row.guideName} sub={row.email} />
        ),
      },
      { title: 'Phone', dataIndex: 'phoneNumber', key: 'phone', width: 130 },
      {
        title: 'Languages',
        key: 'languages',
        width: 140,
        render: (_, row) => (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {row.languages.map((code) => (
              <LangChip key={code} code={code} />
            ))}
          </div>
        ),
      },
      {
        title: 'Applied At',
        dataIndex: 'appliedAt',
        key: 'appliedAt',
        width: 150,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 110,
        render: (s: SlotApplicantRow['status']) => <StatusBadge status={s} />,
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 160,
        fixed: 'right',
        render: (_, row) => {
          const missingId = row.applicationId == null;
          const isBusy = approvingId === row.applicationId;
          return (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <LockedAction allowed={canAssign}>
                <AppButton
                  size="xs"
                  disabled={missingId || isBusy}
                  onClick={() => {
                    if (row.applicationId == null) {
                      showToast('Application ID not available');
                      return;
                    }
                    void handleApprove(row.applicationId);
                  }}
                >
                  {isBusy ? 'Approving…' : 'Approve'}
                </AppButton>
              </LockedAction>
              <LockedAction allowed={canAssign}>
                <AppButton
                  variant="secondary"
                  size="xs"
                  disabled={missingId || isBusy}
                  onClick={() => {
                    if (row.applicationId == null) {
                      showToast('Application ID not available');
                      return;
                    }
                    setMoveApplicationId(row.applicationId);
                  }}
                >
                  Move
                </AppButton>
              </LockedAction>
            </div>
          );
        },
      },
    ],
    [approvingId, handleApprove, canAssign],
  );

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={
          summary
            ? `Applicants — ${summary.tourName}`
            : tourSlotId
              ? `Applicants — Slot #${tourSlotId}`
              : 'Applicants'
        }
        placement="right"
        width={820}
        destroyOnClose
      >
        {status === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spin />
          </div>
        )}

        {status === 'failed' && (
          <ListErrorState message={error} onRetry={() => void loadApplicants()} />
        )}

        {status === 'succeeded' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {summary && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 12,
                  padding: 14,
                  borderRadius: 12,
                  border: '1px solid var(--border-color)',
                  background: 'var(--g50)',
                }}
              >
                <SummaryItem label="Tour" value={summary.tourName} />
                <SummaryItem label="Tour Code" value={summary.tourCode} />
                <SummaryItem label="Date" value={summary.dateLabel} />
                <SummaryItem label="Time" value={summary.timeRange} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Language
                  </span>
                  {summary.languageCode && summary.languageCode !== '—' ? (
                    <LangChip code={summary.languageCode as LangCode} />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 600 }}>—</span>
                  )}
                </div>
                <SummaryItem label="Filled" value={summary.filledLabel} />
                <SummaryItem label="Pay Rate" value={summary.payRateLabel} />
                <SummaryItem
                  label="Guests"
                  value={summary.guestCount != null ? String(summary.guestCount) : '—'}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Status
                  </span>
                  <div style={{ alignSelf: 'flex-start' }}>
                    <StatusBadge status={summary.status} />
                  </div>
                </div>
              </div>
            )}

            <DataTable<SlotApplicantRow>
              rowKey="id"
              columns={columns}
              dataSource={applicants}
              pagination={false}
              size="small"
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: 'No applicants for this slot' }}
            />
          </div>
        )}
      </Drawer>

      <MoveApplicationModal
        open={moveApplicationId != null}
        applicationId={moveApplicationId}
        tourSlotId={tourSlotId}
        date={moveDate}
        languageID={moveLanguageID}
        tourTypeIds={moveTourTypeIds}
        status={moveStatus}
        onClose={() => setMoveApplicationId(null)}
        onSuccess={() => {
          void loadApplicants();
          onMutated?.();
        }}
      />
    </>
  );
}
