import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { mapGuideSlots, type GuideSlotRow } from '@/api/mappers/guideSlotMapper';
import {
  AppButton,
  DataTable,
  LangChip,
  ListErrorState,
  LockedAction,
  showToast,
} from '@/components/ui';
import { applicationsApi } from '@/features/applications/applicationsApi';
import { useCan } from '@/features/auth/useCan';

export interface MoveApplicationModalProps {
  open: boolean;
  applicationId: number | null;
  date: string | null;
  languageID: string | null;
  tourTypeIds: string | null;
  status: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MoveApplicationModal({
  open,
  applicationId,
  date,
  languageID,
  tourTypeIds,
  status: slotStatus,
  onClose,
  onSuccess,
}: MoveApplicationModalProps) {
  const can = useCan();
  const canAssign = can('Applications.Assign');
  const [rows, setRows] = useState<GuideSlotRow[]>([]);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>(
    'idle',
  );
  const [error, setError] = useState<string | null>(null);
  const [assigningSlotId, setAssigningSlotId] = useState<number | null>(null);

  const canLoad = Boolean(
    open && applicationId != null && date?.trim() && languageID?.trim(),
  );

  const loadSlots = useCallback(async () => {
    if (!date?.trim() || !languageID?.trim()) return;
    setLoadStatus('loading');
    setError(null);
    try {
      const records = await applicationsApi.getGuideSlots({
        date: date.trim(),
        languageID: languageID.trim(),
        tourTypeIds: tourTypeIds?.trim() ?? '',
        status: slotStatus?.trim() ?? '',
      });
      setRows(mapGuideSlots(records));
      setLoadStatus('succeeded');
    } catch (err) {
      setLoadStatus('failed');
      setError(getApiErrorMessage(err));
      setRows([]);
    }
  }, [date, languageID, tourTypeIds, slotStatus]);

  useEffect(() => {
    if (canLoad) {
      void loadSlots();
    } else if (!open) {
      setRows([]);
      setLoadStatus('idle');
      setError(null);
      setAssigningSlotId(null);
    }
  }, [canLoad, open, loadSlots]);

  const handleAssign = useCallback(
    async (tourSlotId: number) => {
      if (applicationId == null) {
        showToast('Application ID not available');
        return;
      }
      setAssigningSlotId(tourSlotId);
      try {
        await applicationsApi.updateApproveGuideApplication({
          tourSlotId,
          applicationId,
          status: 'Approved',
        });
        showToast('✓ Application moved');
        onClose();
        onSuccess?.();
      } catch (err) {
        showToast(getApiErrorMessage(err));
      } finally {
        setAssigningSlotId(null);
      }
    },
    [applicationId, onClose, onSuccess],
  );

  const columns: ColumnsType<GuideSlotRow> = useMemo(
    () => [
      { title: 'Tour', dataIndex: 'tourName', key: 'tour', width: 160 },
      { title: 'Tour Code', dataIndex: 'tourCode', key: 'tourCode', width: 100 },
      {
        title: 'Date',
        dataIndex: 'dateLabel',
        key: 'date',
        width: 110,
        render: (label: string) => <strong>{label}</strong>,
      },
      { title: 'Time', dataIndex: 'timeRange', key: 'time', width: 110 },
      {
        title: 'Language',
        dataIndex: 'language',
        key: 'language',
        width: 90,
        render: (lang: GuideSlotRow['language']) => <LangChip code={lang} />,
      },
      {
        title: 'Applicants',
        dataIndex: 'totalApplicants',
        key: 'applicants',
        width: 100,
      },
      {
        title: 'PAX',
        dataIndex: 'totalPax',
        key: 'pax',
        width: 70,
        render: (value: number) => <strong>{value}</strong>,
      },
      {
        title: 'Admin Notes',
        key: 'adminNotes',
        width: 160,
        render: (_, row) =>
          row.adminNotes?.trim() ? (
            <span>{row.adminNotes}</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>—</span>
          ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 100,
        fixed: 'right',
        render: (_, row) => {
          const isBusy = assigningSlotId === row.tourSlotId;
          return (
            <LockedAction allowed={canAssign}>
              <AppButton
                size="xs"
                disabled={isBusy || assigningSlotId != null}
                onClick={() => void handleAssign(row.tourSlotId)}
              >
                {isBusy ? 'Assigning…' : 'Assign'}
              </AppButton>
            </LockedAction>
          );
        },
      },
    ],
    [assigningSlotId, handleAssign, canAssign],
  );

  return (
    <Modal
      open={open}
      title="Move Application"
      onCancel={onClose}
      destroyOnClose
      width={920}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AppButton variant="secondary" onClick={onClose}>
            Cancel
          </AppButton>
        </div>
      }
    >
      {!canLoad && open && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Missing application, date, or language ID — cannot load destination slots.
        </div>
      )}

      {canLoad && loadStatus === 'loading' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      )}

      {canLoad && loadStatus === 'failed' && (
        <ListErrorState message={error} onRetry={() => void loadSlots()} />
      )}

      {canLoad && loadStatus === 'succeeded' && rows.length === 0 && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
          No matching slots for these filters.
        </div>
      )}

      {canLoad && loadStatus === 'succeeded' && rows.length > 0 && (
        <DataTable<GuideSlotRow>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="small"
          scroll={{ x: 'max-content' }}
        />
      )}
    </Modal>
  );
}
