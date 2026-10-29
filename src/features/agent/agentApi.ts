import { axiosInstance } from '@/api/axiosInstance';
import { normalizeListResponse } from '@/api/utils/normalizeList';
import type {
  AgentProfileResponse,
  AgentRecord,
  AllAgentsAdminFilter,
  ApproveRejectAgents,
  GuideCategoryRecord,
  GuideUpdateProfilePayload,
} from '@/api/types';
import type { SignUpAdminPayload } from '@/api/types/adminSignUp';
import type { UpdateAdminProfilePayload } from '@/api/types/adminProfile';
import type { AdminUserRecord } from '@/api/types/adminUser';
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

  getAgentProfileByUserId: async (
    userId: string,
    params: { pageNumber?: number; pageSize?: number } = {},
  ): Promise<AgentProfileResponse | null> => {
    const pageNumber = params.pageNumber ?? 1;
    const pageSize = params.pageSize ?? 25;
    const query = new URLSearchParams({
      userId,
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    const { data } = await axiosInstance.post(
      `/v1/Agent/get-agents-By-UserId?${query.toString()}`,
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

  getAllCategories: async (): Promise<GuideCategoryRecord[]> => {
    const { data } = await axiosInstance.get('/v1/Agent/get-all-categories');
    return normalizeListResponse<GuideCategoryRecord>(data);
  },

  signUpAdmin: async (payload: SignUpAdminPayload): Promise<void> => {
    await axiosInstance.post('/v1/Agent/sign-up-admin', payload);
  },

  updateAdminProfile: async (payload: UpdateAdminProfilePayload): Promise<void> => {
    await axiosInstance.post('/v1/Agent/update-admin-profile', payload);
  },

  getAllAdmins: async (userId?: string): Promise<AdminUserRecord[]> => {
    const url = userId?.trim()
      ? `/v1/Agent/get-all-admins-by-userId?userId=${encodeURIComponent(userId.trim())}`
      : '/v1/Agent/get-all-admins-by-userId';
    const { data } = await axiosInstance.post(url);
    return normalizeListResponse<AdminUserRecord>(data);
  },
};
