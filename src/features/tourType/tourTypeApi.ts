import { axiosInstance } from '@/api/axiosInstance';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type { TourType } from '@/api/types';
import { unwrapData } from '@/api/types';

export const tourTypeApi = {
  getAll: async (): Promise<TourType[]> => {
    const { data } = await axiosInstance.post('/api/TourType/get-all', {});
    return normalizeListResponse<TourType>(data);
  },

  getById: async (id: number): Promise<TourType | null> => {
    const { data } = await axiosInstance.post('/api/TourType/getbyid', null, {
      params: { id },
    });
    return unwrapData<TourType>(data);
  },

  create: async (payload: TourType): Promise<TourType> => {
    const { data } = await axiosInstance.post('/api/TourType/create', payload);
    return unwrapData<TourType>(data);
  },

  update: async (payload: TourType): Promise<TourType> => {
    const { data } = await axiosInstance.post('/api/TourType/update', payload);
    return unwrapData<TourType>(data);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.post('/api/TourType/delete', null, { params: { id } });
  },
};
