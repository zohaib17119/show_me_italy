import { axiosInstance } from '@/api/axiosInstance';
import type { AgentApplication } from '@/api/types';
import { unwrapData } from '@/api/types';

export const applicationsApi = {
  getApplications: async (payload: Record<string, unknown> = {}): Promise<AgentApplication[]> => {
    const { data } = await axiosInstance.post('/v1/AgentApplications/get-application', payload);
    return unwrapData<AgentApplication[]>(data) ?? [];
  },

  apply: async (payload: Record<string, unknown>): Promise<void> => {
    await axiosInstance.post('/v1/AgentApplications/apply', payload);
  },
};
