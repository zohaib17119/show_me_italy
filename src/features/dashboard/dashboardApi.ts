import { axiosInstance } from '@/api/axiosInstance';
import type { AdminDashboardData } from '@/api/types';
import { unwrapData } from '@/api/types';

export const dashboardApi = {
  getAdminDashboard: async (userId: string): Promise<AdminDashboardData> => {
    const { data } = await axiosInstance.get('/admin', {
      params: { userId },
    });
    return unwrapData<AdminDashboardData>(data) ?? {};
  },
};
