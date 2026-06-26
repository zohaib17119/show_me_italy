import { axiosInstance } from '@/api/axiosInstance';
import type { AdminDashboardData } from '@/api/types';
import { unwrapData } from '@/api/types';

export const dashboardApi = {
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const { data } = await axiosInstance.get('/admin');
    return unwrapData<AdminDashboardData>(data) ?? {};
  },
};
