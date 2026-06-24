import { axiosInstance } from '@/api/axiosInstance';
import type { TourSlot } from '@/api/types';
import { unwrapData } from '@/api/types';

export const tourApi = {
  getAll: async (): Promise<TourSlot[]> => {
    const { data } = await axiosInstance.post('/v1/Tour/get-all', {});
    return unwrapData<TourSlot[]>(data) ?? [];
  },

  getById: async (id: number): Promise<TourSlot | null> => {
    const { data } = await axiosInstance.post('/v1/Tour/getbyid', null, {
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
