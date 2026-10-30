import { axiosInstance } from '@/api/axiosInstance';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type {
  ExportGuideEarningsParams,
  GetGuideEarningsDetailParams,
  GetGuideEarningsParams,
  GuideEarningsDetailRecord,
  GuideEarningsRecord,
} from '@/api/types/guideEarnings';

function parseFilenameFromContentDisposition(header: string | undefined): string | null {
  if (!header) return null;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim().replace(/^"|"$/g, ''));
    } catch {
      return utfMatch[1].trim().replace(/^"|"$/g, '');
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(header);
  return plainMatch?.[1]?.trim() || null;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const earningsApi = {
  getGuideEarnings: async (
    params: GetGuideEarningsParams,
  ): Promise<GuideEarningsRecord[]> => {
    const query: Record<string, string | number> = {
      fromDate: params.fromDate,
      toDate: params.toDate,
      pagenumber: params.pagenumber,
      pagesize: params.pagesize,
    };
    if (params.guideId?.trim()) {
      query.guideId = params.guideId.trim();
    }

    const { data } = await axiosInstance.get('/admin-guide-earnings', {
      params: query,
    });
    return normalizeListResponse<GuideEarningsRecord>(data);
  },

  getGuideEarningsDetail: async (
    params: GetGuideEarningsDetailParams,
  ): Promise<GuideEarningsDetailRecord[]> => {
    const trimmed = params.guideId.trim();
    if (!trimmed) return [];

    const { data } = await axiosInstance.get('/admin-guide-earnings-detail', {
      params: {
        guideId: trimmed,
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
    return normalizeListResponse<GuideEarningsDetailRecord>(data);
  },

  exportGuideEarnings: async (params: ExportGuideEarningsParams): Promise<void> => {
    const fromDate = params.fromDate.trim();
    const toDate = params.toDate.trim();
    const query: Record<string, string> = { fromDate, toDate };
    if (params.guideId?.trim()) {
      query.guideId = params.guideId.trim();
    }

    const response = await axiosInstance.get('/export-admin-guide-earnings', {
      params: query,
      responseType: 'blob',
      headers: { Accept: '*/*' },
    });

    const blob = response.data as Blob;
    const headerFilename = parseFilenameFromContentDisposition(
      response.headers['content-disposition'] as string | undefined,
    );
    const filename =
      headerFilename || `guide-earnings-${fromDate}-to-${toDate}.csv`;

    triggerBlobDownload(blob, filename);
  },

  exportGuideEarningsDetail: async (
    params: GetGuideEarningsDetailParams,
  ): Promise<void> => {
    const guideId = params.guideId.trim();
    if (!guideId) return;

    const fromDate = params.fromDate.trim();
    const toDate = params.toDate.trim();

    const response = await axiosInstance.get('/export-admin-guide-earnings-detail', {
      params: { guideId, fromDate, toDate },
      responseType: 'blob',
      headers: { Accept: '*/*' },
    });

    const blob = response.data as Blob;
    const headerFilename = parseFilenameFromContentDisposition(
      response.headers['content-disposition'] as string | undefined,
    );
    const filename =
      headerFilename ||
      `guide-earnings-detail-${guideId}-${fromDate}-to-${toDate}.csv`;

    triggerBlobDownload(blob, filename);
  },
};
