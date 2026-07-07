import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { AppButton, FormInput, FormTextarea, showToast } from '@/components/ui';
import { agentApi } from '@/features/agent/agentApi';
import type { Guide } from '@/mocks/guides';

interface UpdateGuideModalProps {
  open: boolean;
  guide: Guide | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function UpdateGuideModal({
  open,
  guide,
  onClose,
  onUpdated,
}: UpdateGuideModalProps) {
  const [favorite, setFavorite] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rating, setRating] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !guide) return;
    setFavorite(guide.favorite ?? false);
    setAdminNotes(guide.adminNotes ?? '');
    setRating(String(guide.rating ?? 0));
  }, [open, guide]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!guide) return;
    setSubmitting(true);
    try {
      await agentApi.updateGuideProfile({
        userId: guide.id,
        favorite,
        adminNotes,
        rating: Number(rating),
      });
      showToast('Guide updated');
      onUpdated();
      onClose();
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={guide ? `Update Guide — ${guide.name}` : 'Update Guide'}
      open={open}
      onCancel={handleClose}
      footer={[
        <AppButton key="cancel" variant="secondary" onClick={handleClose} disabled={submitting}>
          Cancel
        </AppButton>,
        <AppButton key="update" onClick={() => void handleSubmit()} disabled={submitting}>
          {submitting ? 'Updating…' : 'Update'}
        </AppButton>,
      ]}
      destroyOnClose
    >
      {guide && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>
            Editing profile for <strong>{guide.name}</strong>
          </p>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              style={{ width: 14, height: 14 }}
            />
            Favorite
          </label>

          <FormTextarea
            label="Admin Notes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
          />

          <FormInput
            label="Rating"
            type="number"
            min={0}
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}
