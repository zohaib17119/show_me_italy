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
