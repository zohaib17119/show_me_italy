import { Modal } from 'antd';
import { AppButton } from '@/components/ui';

interface DeactivateGuideModalProps {
  open: boolean;
  guideName?: string;
  mode: 'activate' | 'deactivate';
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeactivateGuideModal({
  open,
  guideName,
  mode,
  loading = false,
  onCancel,
  onConfirm,
}: DeactivateGuideModalProps) {
  const isActivate = mode === 'activate';
  const title = guideName
    ? isActivate
      ? `Activate ${guideName}`
      : `Deactivate ${guideName}`
    : isActivate
      ? 'Activate Guide'
      : 'Deactivate Guide';

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={[
        <AppButton key="cancel" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </AppButton>,
        <AppButton
          key="confirm"
          variant={isActivate ? 'primary' : 'warn'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (isActivate ? 'Activating…' : 'Deactivating…') : 'Confirm'}
        </AppButton>,
      ]}
      destroyOnClose
    >
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
        {isActivate
          ? 'Are you sure you want to activate this guide?'
          : 'Are you sure you want to deactivate this guide?'}
      </p>
    </Modal>
  );
}
