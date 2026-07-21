import { useRef, type ChangeEvent } from 'react';
import { readImageFileAsBase64 } from '@/api/utils/fileToBase64';
import { AppButton, FormLabel, showToast } from '@/components/ui';

export interface AdminProfilePictureValue {
  previewUrl: string | null;
  base64: string | null;
}

interface AdminProfilePicturePickerProps {
  value: AdminProfilePictureValue;
  onChange: (value: AdminProfilePictureValue) => void;
  disabled?: boolean;
}

export function AdminProfilePicturePicker({
  value,
  onChange,
  disabled = false,
}: AdminProfilePicturePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await readImageFileAsBase64(file);
      onChange({
        previewUrl: result.previewUrl,
        base64: result.base64,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to read image');
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange({ previewUrl: null, base64: null });
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <FormLabel>Profile picture (optional)</FormLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
        style={{ display: 'none' }}
        disabled={disabled}
        onChange={(e) => void handleFileChange(e)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {value.previewUrl ? (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: 'var(--g50)',
            }}
          >
            <img
              src={value.previewUrl}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '1px dashed var(--border-color)',
              background: 'var(--g50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: 8,
            }}
          >
            No photo
          </div>
        )}

        <AppButton
          variant="secondary"
          size="xs"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {value.previewUrl ? 'Replace photo' : 'Choose photo'}
        </AppButton>

        {value.previewUrl && (
          <AppButton variant="secondary" size="xs" disabled={disabled} onClick={handleRemove}>
            Remove
          </AppButton>
        )}
      </div>
    </div>
  );
}
