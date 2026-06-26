import { useState } from 'react';
import { Modal } from 'antd';
import { AppButton, FormTextarea } from '@/components/ui';

interface RejectAgentModalProps {
  open: boolean;
  guideName?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectAgentModal({
  open,
  guideName,
  loading = false,
  onCancel,
  onConfirm,
}: RejectAgentModalProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <Modal
      title={guideName ? `Reject ${guideName}` : 'Reject Guide'}
      open={open}
      onCancel={handleClose}
      footer={[
        <AppButton key="cancel" variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </AppButton>,
        <AppButton key="reject" variant="danger" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Rejecting…' : 'Reject Guide'}
        </AppButton>,
      ]}
      destroyOnClose
    >
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        Optionally provide a reason for rejection. The guide may see this message.
      </p>
      <FormTextarea
        label="Reason (optional)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Missing certification document"
        rows={3}
      />
    </Modal>
  );
}
