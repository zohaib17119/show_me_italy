import { useCallback, useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import { mapGuideSlots } from '@/api/mappers/guideSlotMapper';
import type { GuideSlotRow } from '@/api/mappers/guideSlotMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { ListErrorState } from '@/components/ui';
import { formatDisplayDate } from '@/api/utils/date';
import { applicationsApi } from '@/features/applications/applicationsApi';
import { GuideSlotsTable } from './GuideSlotsTable';
import { PreviewTicketModal } from './PreviewTicketModal';
import { UploadTicketModal } from './UploadTicketModal';

interface GuideSlotsModalProps {
 open: boolean;
 dateKey: string | null;
 languageID?: string;
 tourTypeIds?: string;
 onClose: () => void;
 onSlotsChanged?: () => void;
}

function formatModalTitle(dateKey: string): string {
 const [y, m, d] = (dateKey ?? '').split('-').map(Number);
 const label = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
 weekday: 'short',
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 });
 return `Guide Slots - ${label}`;
}

export function GuideSlotsModal({
 open,
 dateKey,
 languageID = '',
 tourTypeIds = '',
 onClose,
 onSlotsChanged,
}: GuideSlotsModalProps) {
 const [rows, setRows] = useState<GuideSlotRow[]>([]);
 const [status, setStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');
 const [error, setError] = useState<string | null>(null);
 const [uploadTarget, setUploadTarget] = useState<GuideSlotRow | null>(null);
 const [previewTarget, setPreviewTarget] = useState<GuideSlotRow | null>(null);

 const loadSlots = useCallback(async () => {
 if (!dateKey) return;
 setStatus('loading');
 setError(null);
 try {
 const records = await applicationsApi.getGuideSlots({
 date: dateKey,
 languageID,
 tourTypeIds,
 status: '',
 });
 setRows(mapGuideSlots(records));
 setStatus('succeeded');
 } catch (err) {
 setStatus('failed');
 setError(getApiErrorMessage(err));
 setRows([]);
 }
 }, [dateKey, languageID, tourTypeIds]);

 useEffect(() => {
 if (open && dateKey) {
 void loadSlots();
 } else if (!open) {
 setRows([]);
 setStatus('idle');
 setError(null);
 setUploadTarget(null);
 setPreviewTarget(null);
 }
 }, [open, dateKey, loadSlots]);

 const handleUploadSuccess = () => {
 setUploadTarget(null);
 void loadSlots();
 };

 return (
 <>
 <Modal
 open={open}
 title={dateKey ? formatModalTitle(dateKey) : 'Guide Slots'}
 onCancel={onClose}
 footer={null}
 width="80%"
 style={{ maxWidth: 1200 }}
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

 {status === 'succeeded' && rows.length === 0 && (
 <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 4px' }}>
 No guide slots for {dateKey ? formatDisplayDate(dateKey) : 'this date'}.
 </div>
 )}

 {status === 'succeeded' && rows.length > 0 && (
 <GuideSlotsTable
 key={dateKey ?? 'slots'}
 rows={rows}
 showSearch={false}
 variant="calendarModal"
 onUploadTicket={setUploadTarget}
 onPreviewTicket={setPreviewTarget}
 onDeleteSuccess={() => {
 void loadSlots();
 onSlotsChanged?.();
 }}
 />
 )}
 </Modal>

 <UploadTicketModal
 open={uploadTarget != null}
 tourSlotId={uploadTarget?.tourSlotId ?? null}
 tourName={uploadTarget?.tourName}
 onClose={() => setUploadTarget(null)}
 onSuccess={handleUploadSuccess}
 />

 <PreviewTicketModal
 open={previewTarget != null}
 ticketUrl={previewTarget?.tickets ?? null}
 tourName={previewTarget?.tourName}
 onClose={() => setPreviewTarget(null)}
 />
 </>
 );
}
