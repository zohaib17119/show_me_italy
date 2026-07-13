import { useRef, type ChangeEvent } from 'react';
import { readTicketFileAsDataUrl } from '@/api/utils/fileToBase64';
import { AppButton, FormLabel, showToast } from '@/components/ui';
import { TicketPreview } from '@/features/applications/components/TicketPreview';
import formStyles from '@/components/ui/forms/forms.module.css';

interface TourTicketFieldProps {
  value?: string | null;
  disabled?: boolean;
  onChange: (value: string | null) => void;
}

export function TourTicketField({
  value,
  disabled = false,
  onChange,
}: TourTicketFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewSrc = value?.trim() ? value.trim() : null;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await readTicketFileAsDataUrl(file);
      onChange(result.dataUrl);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to read file');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={formStyles.formField}>
      <FormLabel>Ticket (optional)</FormLabel>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,image/png,.png,image/jpeg,.jpg,.jpeg"
        style={{ display: 'none' }}
        disabled={disabled}
        onChange={(e) => void handleFileChange(e)}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <AppButton
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {previewSrc ? 'Replace Ticket' : 'Upload Ticket'}
        </AppButton>
        {previewSrc && (
          <AppButton variant="secondary" size="sm" disabled={disabled} onClick={handleClear}>
            Remove
          </AppButton>
        )}
      </div>

      {previewSrc ? (
        <TicketPreview src={previewSrc} minHeight={280} />
      ) : (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            padding: '16px 12px',
            textAlign: 'center',
            border: '1px dashed var(--border-color)',
            borderRadius: 8,
          }}
        >
          PDF, PNG, or JPEG — optional
        </div>
      )}
    </div>
  );
}
