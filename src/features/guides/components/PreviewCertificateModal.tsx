import { Modal } from 'antd';
import { AppButton } from '@/components/ui';
import { TicketPreview } from '@/features/applications/components/TicketPreview';

interface PreviewCertificateModalProps {
  open: boolean;
  certificateUrl: string | null;
  guideName?: string;
  onClose: () => void;
}

export function PreviewCertificateModal({
  open,
  certificateUrl,
  guideName,
  onClose,
}: PreviewCertificateModalProps) {
  return (
    <Modal
      open={open}
      title={guideName ? `View Certificate — ${guideName}` : 'View Certificate'}
      onCancel={onClose}
      width={820}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <AppButton variant="secondary" onClick={onClose}>
            Close
          </AppButton>
        </div>
      }
    >
      {certificateUrl ? (
        <TicketPreview src={certificateUrl} minHeight={520} />
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 24 }}>
          No certificate available to preview.
        </div>
      )}
    </Modal>
  );
}
