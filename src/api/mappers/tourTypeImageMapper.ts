import type { TourType, TourTypeImagePayload, TourTypeImageRecord } from '@/api/types';

export interface TourTypeImageItem {
  clientId: string;
  imageId: number | null;
  previewUrl: string;
  uploadData?: string;
}

function isTourTypeImageRecord(value: unknown): value is TourTypeImageRecord {
  return typeof value === 'object' && value != null && ('id' in value || 'tourTypeImage' in value);
}

function resolvePreviewUrl(source: string): string {
  const trimmed = source.trim();
  if (trimmed.startsWith('data:') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `data:image/jpeg;base64,${trimmed}`;
}

function mapRecordToItem(record: TourTypeImageRecord, index: number): TourTypeImageItem | null {
  const url = record.tourTypeImage?.trim();
  if (!url) return null;

  const imageId = record.id != null && record.id > 0 ? record.id : null;
  return {
    clientId: imageId != null ? `existing-${imageId}` : `existing-${index}-${url.slice(0, 24)}`,
    imageId,
    previewUrl: resolvePreviewUrl(url),
  };
}

function mapStringToItem(source: string, index: number): TourTypeImageItem {
  const trimmed = source.trim();
  return {
    clientId: `legacy-${index}-${trimmed.slice(0, 24)}`,
    imageId: null,
    previewUrl: resolvePreviewUrl(trimmed),
    uploadData: trimmed.startsWith('data:') ? trimmed : undefined,
  };
}

export function mapTourTypeImagesFromApi(
  raw: TourType['tourTypeImage'],
): TourTypeImageItem[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw.flatMap((entry, index) => {
    if (typeof entry === 'string') {
      return entry.trim() ? [mapStringToItem(entry, index)] : [];
    }
    if (isTourTypeImageRecord(entry)) {
      const mapped = mapRecordToItem(entry, index);
      return mapped ? [mapped] : [];
    }
    return [];
  });
}

export function buildTourTypeImagePayload(
  items: TourTypeImageItem[],
): TourTypeImagePayload[] {
  return items.map((item) => {
    if (item.imageId != null && item.imageId > 0) {
      return { id: item.imageId };
    }

    return {
      id: 0,
      tourTypeImage: item.uploadData ?? item.previewUrl,
    };
  });
}
