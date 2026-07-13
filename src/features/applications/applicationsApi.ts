import { axiosInstance } from '@/api/axiosInstance';
import type {
  AgentApplication,
  ApplicationCalendarDayRecord,
  AssignGuideApplicationPayload,
  AvailableGuideRecord,
  GuideSlotApplicantsResponse,
  GuideSlotRecord,
  PendingTourSlotRecord,
} from '@/api/types';
import { unwrapData } from '@/api/types';
import { normalizeListResponse } from '@/api/utils/normalizeList';

export type ApplicationStatus = 'Approved' | 'Rejected' | 'Hold';

export interface ApproveGuideApplicationPayload {
  applicationId: number;
  status: ApplicationStatus;
}

export interface GetAvailableGuidesParams {
  tourSlotId: number;
  isAll: boolean;
}

export interface ApplyTourPayload {
  guideId: string;
  tourSlotId: number;
  status: 'Approved';
}

export interface GetGuideSlotsParams {
  date?: string;
  languageID?: string;
  tourTypeIds?: string;
  status?: string;
}

export interface UpdateApproveGuideApplicationPayload {
  tourSlotId: number;
  applicationId: number;
  status: 'Approved';
}

export const applicationsApi = {
  getAllAdminPending: async (options?: { date?: string }): Promise<AgentApplication[]> => {
    const { data } = await axiosInstance.post('/api/AgentApplications/get-all-admin', null, {
      params: {
        status: 'pending',
        ...(options?.date ? { date: options.date } : {}),
      },
    });
    return normalizeListResponse<AgentApplication>(data);
  },

  getPendingTourSlotsByDate: async (date: string): Promise<PendingTourSlotRecord[]> => {
    const { data } = await axiosInstance.post('/api/AgentApplications/get-all-admin', null, {
      params: {
        status: 'pending',
        date,
      },
    });
    return normalizeListResponse<PendingTourSlotRecord>(data);
  },

  getAllPendingCounts: async (): Promise<ApplicationCalendarDayRecord[]> => {
    try {
      const { data } = await axiosInstance.post(
        '/api/AgentApplications/get-all-pending-counts',
        null,
      );
      return normalizeListResponse<ApplicationCalendarDayRecord>(data);
    } catch {
      return [];
    }
  },

  getGuideSlots: async (params?: GetGuideSlotsParams): Promise<GuideSlotRecord[]> => {
    const { data } = await axiosInstance.post('/api/AgentApplications/guide-slots', {
      date: params?.date ?? '',
      languageID: params?.languageID ?? '',
      tourTypeIds: params?.tourTypeIds ?? '',
      status: params?.status ?? '',
    });
    return normalizeListResponse<GuideSlotRecord>(data);
  },

  getPendingGuideSlots: async (): Promise<GuideSlotRecord[]> => {
    const { data } = await axiosInstance.get('/api/AgentApplications/pending-guide-slots');
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

  updateApproveGuideApplication: async (
    payload: UpdateApproveGuideApplicationPayload,
  ): Promise<void> => {
    await axiosInstance.post(
      '/api/AgentApplications/update-approve-guide-application',
      payload,
    );
  },

  getAvailableGuides: async (
    params: GetAvailableGuidesParams,
  ): Promise<AvailableGuideRecord[]> => {
    const { data } = await axiosInstance.get('/api/AgentApplications/get-available-guide', {
      params: {
        tourSlotId: params.tourSlotId,
        isAll: params.isAll,
      },
    });
    return normalizeListResponse<AvailableGuideRecord>(data);
  },

  applyTour: async (payload: ApplyTourPayload): Promise<void> => {
    await axiosInstance.post('/api/AgentApplications/admin-apply-tour', payload);
  },

  assignGuideApplication: async (payload: AssignGuideApplicationPayload): Promise<void> => {
    await axiosInstance.post('/api/AgentApplications/assign-guide-application', payload);
  },

  apply: async (payload: Record<string, unknown>): Promise<void> => {
    await axiosInstance.post('/v1/AgentApplications/apply', payload);
  },
};
