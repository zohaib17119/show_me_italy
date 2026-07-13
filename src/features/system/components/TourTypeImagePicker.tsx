import { useRef, type ChangeEvent } from 'react';
import { readImageFileAsBase64 } from '@/api/utils/fileToBase64';
import type { TourTypeImageItem } from '@/api/mappers/tourTypeImageMapper';
import { AppButton, FormLabel, showToast } from '@/components/ui';

export type { TourTypeImageItem };

interface TourTypeImagePickerProps {
  images: TourTypeImageItem[];
  onChange: (images: TourTypeImageItem[]) => void;
  disabled?: boolean;
}

export function TourTypeImagePicker({
  images,
  onChange,
  disabled = false,
}: TourTypeImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const nextImages = [...images];
    const errors: string[] = [];

    for (const file of Array.from(fileList)) {
      try {
        const result = await readImageFileAsBase64(file);
        nextImages.push({
          clientId: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 8)}`,
          imageId: null,
          previewUrl: result.previewUrl,
          uploadData: result.previewUrl,
        });
      } catch (err) {
        errors.push(err instanceof Error ? err.message : 'Failed to read image');
      }
    }

    if (nextImages.length > images.length) {
      onChange(nextImages);
    }

    if (errors.length > 0) {
      showToast(errors[0]);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (clientId: string) => {
    onChange(images.filter((image) => image.clientId !== clientId));
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <FormLabel>Tour Images</FormLabel>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp,.png,.jpg,.jpeg,.webp"
        style={{ display: 'none' }}
        disabled={disabled}
        onChange={(e) => void handleFileChange(e)}
      />

      <AppButton
        variant="secondary"
        size="xs"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        style={{ marginBottom: 10 }}
      >
        Choose images
      </AppButton>

      {images.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          No images selected. You can add multiple images before saving.
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {images.map((image) => (
            <div
              key={image.clientId}
              style={{
                position: 'relative',
                width: 64,
                height: 64,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                background: 'var(--g50)',
              }}
            >
              <img
                src={image.previewUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                aria-label="Remove image"
                disabled={disabled}
                onClick={() => handleRemove(image.clientId)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  border: 'none',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#fff',
                  fontSize: 12,
                  lineHeight: 1,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
