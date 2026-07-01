import { axiosInstance } from '@/api/axiosInstance';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type { CalendarDaySummaryRecord, TourSlot, TourSlotFilter } from '@/api/types';
import { unwrapData } from '@/api/types';

export const tourApi = {
  getAllAdmin: async (filter: TourSlotFilter = {}): Promise<TourSlot[]> => {
    const { data } = await axiosInstance.post('/v1/Tour/get-all-admin', filter);
    return normalizeListResponse<TourSlot>(data);
  },

  getCalendarSummaries: async (
    filter: TourSlotFilter = {},
  ): Promise<CalendarDaySummaryRecord[]> => {
    const { data } = await axiosInstance.post('/v1/Tour/get-all-admin', filter);
    return normalizeListResponse<CalendarDaySummaryRecord>(data);
  },

  getAll: async (): Promise<TourSlot[]> => tourApi.getAllAdmin({}),

  getById: async (id: number): Promise<TourSlot | null> => {
    const { data } = await axiosInstance.get('/v1/Tour/getbyid', {
      params: { id },
    });
    return unwrapData<TourSlot>(data);
  },

  create: async (payload: TourSlot): Promise<TourSlot> => {
    const { data } = await axiosInstance.post('/v1/Tour/create', payload);
    return unwrapData<TourSlot>(data);
  },

  update: async (payload: TourSlot): Promise<TourSlot> => {
    const { data } = await axiosInstance.post('/v1/Tour/update', payload);
    return unwrapData<TourSlot>(data);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.post('/v1/Tour/delete', null, { params: { id } });
  },
};
