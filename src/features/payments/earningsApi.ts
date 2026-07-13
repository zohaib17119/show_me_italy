import { axiosInstance } from '@/api/axiosInstance';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type {
  GetGuideEarningsParams,
  GuideEarningsRecord,
} from '@/api/types/guideEarnings';

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
};
