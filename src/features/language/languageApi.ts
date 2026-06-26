import { axiosInstance } from '@/api/axiosInstance';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type { Language } from '@/api/types';
import { unwrapData } from '@/api/types';

export const languageApi = {
  getAll: async (): Promise<Language[]> => {
    const { data } = await axiosInstance.get('/api/Language/get-all', {});
    return normalizeListResponse<Language>(data);
  },

  getById: async (id: number): Promise<Language | null> => {
    const { data } = await axiosInstance.post('/api/Language/getbyid', null, {
      params: { id },
    });
    return unwrapData<Language>(data);
  },

  create: async (payload: Language): Promise<Language> => {
    const { data } = await axiosInstance.post('/api/Language/create', payload);
    return unwrapData<Language>(data);
  },

  update: async (payload: Language): Promise<Language> => {
    const { data } = await axiosInstance.post('/api/Language/update', payload);
    return unwrapData<Language>(data);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.post('/api/Language/delete', null, { params: { id } });
  },
};
