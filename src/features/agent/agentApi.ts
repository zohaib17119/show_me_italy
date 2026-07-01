import { axiosInstance } from '@/api/axiosInstance';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type {
  AgentProfileResponse,
  AgentRecord,
  AllAgentsAdminFilter,
  ApproveRejectAgents,
  GuideUpdateProfilePayload,
} from '@/api/types';
import { unwrapData } from '@/api/types';

export const agentApi = {
  getAllAgentsAdmin: async (filter: AllAgentsAdminFilter = {}): Promise<AgentRecord[]> => {
    const { data } = await axiosInstance.post('/v1/Agent/get-all-agents-admin', filter);
    return normalizeListResponse<AgentRecord>(data);
  },

  getUnverifiedAgents: async (): Promise<AgentRecord[]> => {
    const { data } = await axiosInstance.get('/v1/Agent/unverified-agents');
    return normalizeListResponse<AgentRecord>(data);
  },

  getAgentProfileByUserId: async (userId: string): Promise<AgentProfileResponse | null> => {
    const { data } = await axiosInstance.post(`/v1/Agent/get-agents-By-UserId?userId=${userId}`
      // , {params: { userId },}
    );
    const payload = unwrapData<AgentProfileResponse>(data);
    if (!payload?.userResponse) return null;
    return payload;
  },

  approveRejectAgent: async (payload: ApproveRejectAgents): Promise<void> => {
    await axiosInstance.post('/v1/Agent/approve-reject-agent', payload);
  },

  updateGuideProfile: async (payload: GuideUpdateProfilePayload): Promise<void> => {
    await axiosInstance.post('/v1/Agent/guide-update-profile', payload);
  },
};
