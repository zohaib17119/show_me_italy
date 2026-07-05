import { Modal } from 'antd';
import { AppButton } from '@/components/ui';
import { TicketPreview } from './TicketPreview';

interface PreviewTicketModalProps {
  open: boolean;
  ticketUrl: string | null;
  tourName?: string;
  onClose: () => void;
}

export function PreviewTicketModal({
  open,
  ticketUrl,
  tourName,
  onClose,
}: PreviewTicketModalProps) {
  return (
    <Modal
      open={open}
      title={tourName ? `Preview Ticket — ${tourName}` : 'Preview Ticket'}
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
      {ticketUrl ? (
        <TicketPreview src={ticketUrl} minHeight={520} />
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 24 }}>
          No ticket available to preview.
        </div>
      )}
    </Modal>
  );
}
