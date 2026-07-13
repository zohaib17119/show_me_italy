const TICKET_MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

const ALLOWED_MIMES = new Set(Object.values(TICKET_MIME_BY_EXT));

export type TicketFileKind = 'pdf' | 'png' | 'jpeg';
export type TicketPreviewKind = 'pdf' | 'image';

function fileExtension(name: string): string {
  const parts = name.toLowerCase().split('.');
  return parts.length > 1 ? (parts.pop() ?? '') : '';
}

function kindFromExtension(ext: string): TicketFileKind | null {
  if (ext === 'pdf') return 'pdf';
  if (ext === 'png') return 'png';
  if (ext === 'jpg' || ext === 'jpeg') return 'jpeg';
  return null;
}

function kindFromMime(mime: string): TicketFileKind | null {
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/jpeg') return 'jpeg';
  return null;
}

export function resolveTicketMime(file: File): string | null {
  const mime = file.type.trim().toLowerCase();
  if (mime && ALLOWED_MIMES.has(mime)) return mime;

  const ext = fileExtension(file.name);
  return TICKET_MIME_BY_EXT[ext] ?? null;
}

export function isAllowedTicketFile(file: File): boolean {
  return resolveTicketMime(file) != null;
}

function normalizeDataUrl(dataUrl: string, mime: string): string {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) {
    return `data:${mime};base64,${dataUrl}`;
  }

  const prefix = dataUrl.slice(0, commaIndex).toLowerCase();
  const payload = dataUrl.slice(commaIndex + 1);
  if (prefix === `data:${mime}` || prefix === `data:${mime};base64`) {
    return dataUrl;
  }

  return `data:${mime};base64,${payload}`;
}

export function readTicketFileAsDataUrl(file: File): Promise<{
  dataUrl: string;
  mime: string;
  kind: TicketFileKind;
}> {
  return new Promise((resolve, reject) => {
    const mime = resolveTicketMime(file);
    if (!mime) {
      reject(new Error('Please select a PDF, PNG, or JPEG file'));
      return;
    }

    const kind = kindFromMime(mime) ?? kindFromExtension(fileExtension(file.name));
    if (!kind) {
      reject(new Error('Please select a PDF, PNG, or JPEG file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      resolve({
        dataUrl: normalizeDataUrl(result, mime),
        mime,
        kind,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function resolveTicketPreviewKind(source: string): TicketPreviewKind {
  const trimmed = source.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith('data:application/pdf')) return 'pdf';
  if (lower.startsWith('data:image/')) return 'image';

  const path = lower.split('?')[0]?.split('#')[0] ?? lower;
  if (path.endsWith('.pdf')) return 'pdf';
  if (/\.(png|jpe?g)$/.test(path)) return 'image';

  return 'pdf';
}

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

const ALLOWED_IMAGE_MIMES = new Set(Object.values(IMAGE_MIME_BY_EXT));

export function resolveImageMime(file: File): string | null {
  const mime = file.type.trim().toLowerCase();
  if (mime && ALLOWED_IMAGE_MIMES.has(mime)) return mime;

  const ext = fileExtension(file.name);
  return IMAGE_MIME_BY_EXT[ext] ?? null;
}

export function isAllowedImageFile(file: File): boolean {
  return resolveImageMime(file) != null;
}

function extractBase64FromDataUrl(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return dataUrl;
  return dataUrl.slice(commaIndex + 1);
}

export function readImageFileAsBase64(file: File): Promise<{
  base64: string;
  previewUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const mime = resolveImageMime(file);
    if (!mime) {
      reject(new Error('Please select a PNG, JPEG, or WebP image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file'));
        return;
      }
      const previewUrl = normalizeDataUrl(result, mime);
      resolve({
        base64: extractBase64FromDataUrl(previewUrl),
        previewUrl,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function toTourTypeImagePreview(source: string, index: number): {
  id: string;
  base64: string;
  previewUrl: string;
} {
  const trimmed = source.trim();
  if (trimmed.startsWith('data:')) {
    return {
      id: `existing-${index}-${trimmed.slice(0, 24)}`,
      base64: extractBase64FromDataUrl(trimmed),
      previewUrl: trimmed,
    };
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      id: `existing-${index}-${trimmed}`,
      base64: trimmed,
      previewUrl: trimmed,
    };
  }
  return {
    id: `existing-${index}`,
    base64: trimmed,
    previewUrl: `data:image/jpeg;base64,${trimmed}`,
  };
}
