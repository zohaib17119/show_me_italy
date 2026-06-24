import { axiosInstance } from '@/api/axiosInstance';
import type { NotificationsDto } from '@/api/types';
import { unwrapData } from '@/api/types';

export const notificationsApi = {
  getAll: async (): Promise<NotificationsDto[]> => {
    const { data } = await axiosInstance.post('/v1/Notifications/get-all', {});
    return unwrapData<NotificationsDto[]>(data) ?? [];
  },

  insert: async (payload: NotificationsDto): Promise<NotificationsDto> => {
    const { data } = await axiosInstance.post('/v1/Notifications/insert', payload);
    return unwrapData<NotificationsDto>(data);
  },

  markAsRead: async (userId: string): Promise<void> => {
    await axiosInstance.post('/v1/Notifications/mark-as-read', null, {
      params: { userid: userId },
    });
  },

  readById: async (notificationId: number): Promise<void> => {
    await axiosInstance.post('/v1/Notifications/read-by-id', null, {
      params: { notificationId },
    });
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.post('/v1/Notifications/delete', null, { params: { id } });
  },
};
