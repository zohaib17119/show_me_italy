import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { getApiErrorMessage } from '@/api/axiosInstance';
import {
  AppButton,
  FormInput,
  FormMultiSelect,
  FormTextarea,
  showToast,
} from '@/components/ui';
import { agentApi } from '@/features/agent/agentApi';
import type { Guide } from '@/mocks/guides';

function parseCategoryLabels(categories?: string): string[] {
  return (categories ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function resolveSelectedCategoryIds(
  guide: Guide,
  options: { value: string; label: string }[],
): string[] {
  const selected = new Set<string>();

  for (const id of guide.guideCategory ?? []) {
    const value = String(id).trim();
    if (value) selected.add(value);
  }

  if (options.length === 0) return [...selected];

  const validIds = new Set(options.map((opt) => opt.value));
  const byLabel = new Map(
    options.map((opt) => [opt.label.trim().toLowerCase(), opt.value]),
  );

  for (const label of parseCategoryLabels(guide.categories)) {
    const matched = byLabel.get(label.toLowerCase());
    if (matched) selected.add(matched);
  }

  return [...selected].filter((id) => validIds.has(id));
}

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
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !guide) return;
    setFavorite(guide.favorite ?? false);
    setAdminNotes(guide.adminNotes ?? '');
    setRating(String(guide.rating ?? 0));
  }, [open, guide]);

  useEffect(() => {
    if (!open || !guide) return;
    setCategoryIds(resolveSelectedCategoryIds(guide, categoryOptions));
  }, [open, guide, categoryOptions]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const records = await agentApi.getAllCategories();
        if (cancelled) return;
        setCategoryOptions(
          records
            .map((record) => {
              const id = String(record.id ?? '').trim();
              if (!id) return null;
              return { value: id, label: record.category?.trim() || id };
            })
            .filter((opt): opt is { value: string; label: string } => opt != null),
        );
      } catch {
        if (!cancelled) {
          setCategoryOptions([]);
          showToast('Failed to load categories');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

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
        cancellationPercentage: guide.cancellationPercentage ?? 0,
        rating: Number(rating),
        guideCategory: categoryIds
          .map(Number)
          .filter((id) => Number.isFinite(id)),
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

          <FormMultiSelect
            label="Categories"
            options={categoryOptions}
            value={categoryIds}
            placeholder="Select categories"
            onChange={setCategoryIds}
          />
        </div>
      )}
    </Modal>
  );
}
