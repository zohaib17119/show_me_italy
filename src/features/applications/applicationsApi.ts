import { axiosInstance } from '@/api/axiosInstance';
import type { AgentApplication } from '@/api/types';
import { normalizeListResponse } from '@/api/utils/normalizeList';

export interface ApproveGuideApplicationPayload {
  applicationId: number;
  status: 'Approved';
}

export const applicationsApi = {
  getAllAdminPending: async (): Promise<AgentApplication[]> => {
    const { data } = await axiosInstance.post('/api/AgentApplications/get-all-admin', null, {
      params: { status: 'pending' },
    });
    return normalizeListResponse<AgentApplication>(data);
  },

  approveGuideApplication: async (payload: ApproveGuideApplicationPayload): Promise<void> => {
    await axiosInstance.post('/api/AgentApplications/approve-guide-application', payload);
  },

  apply: async (payload: Record<string, unknown>): Promise<void> => {
    await axiosInstance.post('/v1/AgentApplications/apply', payload);
  },
};
