import { axiosInstance } from '@/api/axiosInstance';
import type {
  AgentApplication,
  AssignGuideApplicationPayload,
  AvailableGuideRecord,
  GuideSlotApplicantsResponse,
  GuideSlotRecord,
} from '@/api/types';
import { unwrapData } from '@/api/types';
import { normalizeListResponse } from '@/api/utils/normalizeList';

export type ApplicationStatus = 'Approved' | 'Rejected';

export interface ApproveGuideApplicationPayload {
  applicationId: number;
  status: ApplicationStatus;
}

export const applicationsApi = {
  getAllAdminPending: async (): Promise<AgentApplication[]> => {
    const { data } = await axiosInstance.post('/api/AgentApplications/get-all-admin', null, {
      params: { status: 'pending' },
    });
    return normalizeListResponse<AgentApplication>(data);
  },

  getGuideSlots: async (): Promise<GuideSlotRecord[]> => {
    const { data } = await axiosInstance.get('/api/AgentApplications/guide-slots');
    return normalizeListResponse<GuideSlotRecord>(data);
  },

  getGuideSlotApplicants: async (
    tourSlotId: number,
  ): Promise<GuideSlotApplicantsResponse> => {
    const { data } = await axiosInstance.get('/api/AgentApplications/guide-slot-applicants', {
      params: { tourSlotId },
    });
    const unwrapped = unwrapData<GuideSlotApplicantsResponse>(data);
    return {
      slotSummary: unwrapped?.slotSummary,
      applicants: unwrapped?.applicants ?? [],
    };
  },

  approveGuideApplication: async (payload: ApproveGuideApplicationPayload): Promise<void> => {
    await axiosInstance.post('/api/AgentApplications/approve-guide-application', payload);
  },

  getAvailableGuides: async (): Promise<AvailableGuideRecord[]> => {
    const { data } = await axiosInstance.get('/api/AgentApplications/get-available-guide');
    return normalizeListResponse<AvailableGuideRecord>(data);
  },

  assignGuideApplication: async (payload: AssignGuideApplicationPayload): Promise<void> => {
    await axiosInstance.post('/api/AgentApplications/assign-guide-application', payload);
  },

  apply: async (payload: Record<string, unknown>): Promise<void> => {
    await axiosInstance.post('/v1/AgentApplications/apply', payload);
  },
};
