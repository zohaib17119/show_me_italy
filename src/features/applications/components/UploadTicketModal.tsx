import { useRef, useState, type ChangeEvent } from 'react';
import { Modal } from 'antd';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { readTicketFileAsDataUrl } from '@/api/utils/fileToBase64';
import { AppButton, showToast } from '@/components/ui';
import { tourApi } from '@/features/tour/tourApi';
import { TicketPreview } from './TicketPreview';

interface UploadTicketModalProps {
  open: boolean;
  tourSlotId: number | null;
  tourName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadTicketModal({
  open,
  tourSlotId,
  tourName,
  onClose,
  onSuccess,
}: UploadTicketModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setFileName('');
    setDataUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await readTicketFileAsDataUrl(file);
      setFileName(file.name);
      setDataUrl(result.dataUrl);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to read file');
      resetState();
    }
  };

  const handleSubmit = async () => {
    if (tourSlotId == null || !dataUrl) return;

    setSubmitting(true);
    try {
      await tourApi.updateTicketTour({ tourSlotId, ticket: dataUrl });
      showToast('Ticket uploaded');
      resetState();
      onSuccess();
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={tourName ? `Upload Ticket — ${tourName}` : 'Upload Ticket'}
      onCancel={handleClose}
      width={720}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <AppButton variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => void handleSubmit()}
            disabled={!dataUrl || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </AppButton>
        </div>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg"
        style={{ display: 'none' }}
        onChange={(e) => void handleFileChange(e)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AppButton variant="secondary" onClick={() => inputRef.current?.click()} disabled={submitting}>
          Choose file
        </AppButton>

        {fileName && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Selected: <strong>{fileName}</strong>
          </div>
        )}

        {dataUrl ? (
          <TicketPreview src={dataUrl} minHeight={420} />
        ) : (
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              padding: '24px 12px',
              textAlign: 'center',
              border: '1px dashed var(--border-color)',
              borderRadius: 8,
            }}
          >
            Select a PDF, PNG, or JPEG to preview before submitting
          </div>
        )}
      </div>
    </Modal>
  );
}
