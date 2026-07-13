import { axiosInstance } from '@/api/axiosInstance';
import type { UpdateAssignSlotPayload } from '@/api/mappers/tourMapper';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type {
  BulkTourSlotCreatePayload,
  CalendarDaySummaryRecord,
  TourSlot,
  TourSlotFilter,
} from '@/api/types';
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

  bulkCreate: async (payload: BulkTourSlotCreatePayload): Promise<unknown> => {
    const { data } = await axiosInstance.post('/v1/Tour/bulk-create', payload);
    return unwrapData<unknown>(data);
  },

  update: async (payload: TourSlot): Promise<TourSlot> => {
    const { data } = await axiosInstance.post('/v1/Tour/update', payload);
    return unwrapData<TourSlot>(data);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.post('/v1/Tour/delete', null, { params: { id } });
  },

  updateTicketTour: async (payload: { tourSlotId: number; ticket: string }): Promise<void> => {
    payload = {
      tourSlotId: payload.tourSlotId,
      ticket: payload.ticket,
    };
    await axiosInstance.post('/v1/Tour/update-ticket-tour', payload);
  },

  updateAssignSlot: async (payload: UpdateAssignSlotPayload): Promise<void> => {
    await axiosInstance.post('/v1/Tour/update-assign-slot', payload);
  },
};
