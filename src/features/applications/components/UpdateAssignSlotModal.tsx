import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { buildUpdateAssignSlotPayload } from '@/api/mappers/tourMapper';
import { AppButton, FormInput, showToast } from '@/components/ui';
import { tourApi } from '@/features/tour/tourApi';

export interface UpdateAssignSlotModalProps {
  open: boolean;
  tourSlotId: number;
  dateKey: string;
  payRatePerHour: number | null;
  startTime: string;
  endTime: string;
  onClose: () => void;
  onSuccess: (values: {
    payRatePerHour: number;
    startTime: string;
    endTime: string;
  }) => void;
}

export function UpdateAssignSlotModal({
  open,
  tourSlotId,
  dateKey,
  payRatePerHour,
  startTime,
  endTime,
  onClose,
  onSuccess,
}: UpdateAssignSlotModalProps) {
  const [payRate, setPayRate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    payRate?: string;
    startTime?: string;
    endTime?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setPayRate(payRatePerHour != null ? String(payRatePerHour) : '');
    setStart(startTime.slice(0, 5));
    setEnd(endTime.slice(0, 5));
    setErrors({});
    setSubmitting(false);
  }, [open, payRatePerHour, startTime, endTime]);

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};
    const rate = Number(payRate);
    if (!payRate.trim() || Number.isNaN(rate) || rate < 0) {
      nextErrors.payRate = 'Enter a valid pay rate';
    }
    if (!start.trim()) nextErrors.startTime = 'Start time is required';
    if (!end.trim()) nextErrors.endTime = 'End time is required';
    if (!dateKey.trim()) {
      showToast('Slot date is missing');
      return;
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildUpdateAssignSlotPayload({
        tourSlotId,
        payRatePerHour: rate,
        slotDate: dateKey,
        startTime: start,
        endTime: end,
      });
      await tourApi.updateAssignSlot(payload);
      showToast('✓ Slot updated');
      onSuccess({
        payRatePerHour: rate,
        startTime: start.slice(0, 5),
        endTime: end.slice(0, 5),
      });
      onClose();
    } catch (err) {
      showToast(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Update Slot"
      onCancel={onClose}
      destroyOnClose
      width={420}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <AppButton variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? 'Updating…' : 'Update'}
          </AppButton>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <FormInput
          label="Pay rate (€/hr)"
          type="number"
          min={0}
          step="0.01"
          value={payRate}
          error={errors.payRate}
          onChange={(e) => {
            setPayRate(e.target.value);
            setErrors((prev) => ({ ...prev, payRate: undefined }));
          }}
        />
        <FormInput
          label="Start time"
          type="time"
          value={start}
          error={errors.startTime}
          onChange={(e) => {
            setStart(e.target.value);
            setErrors((prev) => ({ ...prev, startTime: undefined }));
          }}
        />
        <FormInput
          label="End time"
          type="time"
          value={end}
          error={errors.endTime}
          onChange={(e) => {
            setEnd(e.target.value);
            setErrors((prev) => ({ ...prev, endTime: undefined }));
          }}
        />
      </div>
    </Modal>
  );
}
