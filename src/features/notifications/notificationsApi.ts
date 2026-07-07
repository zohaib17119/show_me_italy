import { axiosInstance } from '@/api/axiosInstance';
import type {
  AnnouncementNotification,
  CreateNotificationPayload,
  NotificationRecipientRecord,
  NotificationsDto,
} from '@/api/types';
import { unwrapData } from '@/api/types';

export interface MarkRecipientAsReadPayload {
  guideId: string;
  notificationRecipientId: number;
  markAll: boolean;
}

export const notificationsApi = {
  getAll: async (): Promise<AnnouncementNotification[]> => {
    const { data } = await axiosInstance.get('/v1/Notification/notification-all', {});
    return unwrapData<AnnouncementNotification[]>(data) ?? [];
  },

  getRecipientsByGuideId: async (guideId: string): Promise<NotificationRecipientRecord[]> => {
    const { data } = await axiosInstance.get('/api/NotificationRecipient/all', {
      params: { GuideId: guideId },
    });
    return unwrapData<NotificationRecipientRecord[]>(data) ?? [];
  },

  markRecipientAsRead: async (payload: MarkRecipientAsReadPayload): Promise<void> => {
    await axiosInstance.post('/api/NotificationRecipient/mark-as-read', payload);
  },

  create: async (payload: CreateNotificationPayload): Promise<unknown> => {
    const { data } = await axiosInstance.post('/v1/Notification/create', payload);
    return unwrapData(data) ?? data;
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
