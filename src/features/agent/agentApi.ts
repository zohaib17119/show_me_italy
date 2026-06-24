import { axiosInstance } from '@/api/axiosInstance';
import type { AgentRecord } from '@/api/types';
import { unwrapData } from '@/api/types';

export const agentApi = {
  getVerifiedAgents: async (): Promise<AgentRecord[]> => {
    const { data } = await axiosInstance.get('/v1/Agent/verified-agents');
    return unwrapData<AgentRecord[]>(data) ?? [];
  },

  getUnverifiedAgents: async (): Promise<AgentRecord[]> => {
    const { data } = await axiosInstance.get('/v1/Agent/unverified-agents');
    return unwrapData<AgentRecord[]>(data) ?? [];
  },

  approveAgent: async (payload: Record<string, unknown>): Promise<void> => {
    await axiosInstance.post('/v1/Agent/approve-agent', payload);
  },

  updateAgentStatus: async (payload: Record<string, unknown>): Promise<void> => {
    await axiosInstance.post('/v1/Agent/agent-status', payload);
  },
};
