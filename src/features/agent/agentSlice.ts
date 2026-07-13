import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  mapAgentToGuide,
  mapAgentsToGuides,
  mapGuideApplicationsToHistory,
  type GuideApplicationRow,
} from '@/api/mappers/agentMapper';
import type { AllAgentsAdminFilter } from '@/api/types';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { Guide } from '@/mocks/guides';
import { agentApi } from './agentApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface AgentState {
  adminGuides: Guide[];
  unverified: Guide[];
  selectedAgent: Guide | null;
  selectedAgentApplications: GuideApplicationRow[];
  selectedAgentPendingApplications: GuideApplicationRow[];
  adminStatus: RequestStatus;
  unverifiedStatus: RequestStatus;
  detailStatus: RequestStatus;
  mutationStatus: RequestStatus;
  adminError: string | null;
  unverifiedError: string | null;
  error: string | null;
}

const initialState: AgentState = {
  adminGuides: [],
  unverified: [],
  selectedAgent: null,
  selectedAgentApplications: [],
  selectedAgentPendingApplications: [],
  adminStatus: 'idle',
  unverifiedStatus: 'idle',
  detailStatus: 'idle',
  mutationStatus: 'idle',
  adminError: null,
  unverifiedError: null,
  error: null,
};

export const fetchAdminGuides = createAsyncThunk(
  'agent/fetchAdminGuides',
  async (filter: AllAgentsAdminFilter | undefined, { rejectWithValue }) => {
    try {
      const records = await agentApi.getAllAgentsAdmin(filter ?? {});
      return mapAgentsToGuides(records);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchUnverifiedAgents = createAsyncThunk(
  'agent/fetchUnverified',
  async (_, { rejectWithValue }) => {
    try {
      const records = await agentApi.getUnverifiedAgents();
      return mapAgentsToGuides(records, { pending: true });
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchAgentById = createAsyncThunk(
  'agent/fetchById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const profile = await agentApi.getAgentProfileByUserId(userId);
      if (!profile?.userResponse) {
        return rejectWithValue('Guide not found');
      }
      const guide = mapAgentToGuide(profile.userResponse);
      const applications = mapGuideApplicationsToHistory(profile.guideApplication);
      const pendingApplications = mapGuideApplicationsToHistory(
        profile.pendingGuideApplication,
      );
      return { guide, applications, pendingApplications };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const approveAgent = createAsyncThunk(
  'agent/approve',
  async (userId: string, { rejectWithValue }) => {
    try {
      await agentApi.approveRejectAgent({ userId, isActive: true });
      return userId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const rejectAgent = createAsyncThunk(
  'agent/reject',
  async (
    payload: { userId: string; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      await agentApi.approveRejectAgent({
        userId: payload.userId,
        isActive: false,
        reasonOfRejection: payload.reason ?? '',
      });
      return payload.userId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const setAgentActiveStatus = createAsyncThunk(
  'agent/setActiveStatus',
  async (
    payload: { userId: string; isActive: boolean },
    { rejectWithValue },
  ) => {
    try {
      await agentApi.approveRejectAgent({
        userId: payload.userId,
        isActive: payload.isActive,
      });
      return payload;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    clearSelectedAgent(state) {
      state.selectedAgent = null;
      state.selectedAgentApplications = [];
      state.selectedAgentPendingApplications = [];
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminGuides.pending, (state) => {
        state.adminStatus = 'loading';
        state.adminError = null;
      })
      .addCase(fetchAdminGuides.fulfilled, (state, action) => {
        state.adminStatus = 'succeeded';
        state.adminGuides = action.payload;
      })
      .addCase(fetchAdminGuides.rejected, (state, action) => {
        state.adminStatus = 'failed';
        state.adminError = (action.payload as string) ?? 'Failed to load guides';
      })
      .addCase(fetchUnverifiedAgents.pending, (state) => {
        state.unverifiedStatus = 'loading';
        state.unverifiedError = null;
      })
      .addCase(fetchUnverifiedAgents.fulfilled, (state, action) => {
        state.unverifiedStatus = 'succeeded';
        state.unverified = action.payload;
      })
      .addCase(fetchUnverifiedAgents.rejected, (state, action) => {
        state.unverifiedStatus = 'failed';
        state.unverifiedError = (action.payload as string) ?? 'Failed to load pending guides';
      })
      .addCase(fetchAgentById.pending, (state) => {
        state.detailStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedAgent = action.payload.guide;
        state.selectedAgentApplications = action.payload.applications;
        state.selectedAgentPendingApplications = action.payload.pendingApplications;
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.selectedAgent = null;
        state.selectedAgentApplications = [];
        state.selectedAgentPendingApplications = [];
        state.error = (action.payload as string) ?? 'Failed to load guide';
      })
      .addCase(approveAgent.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(approveAgent.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(approveAgent.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to approve guide';
      })
      .addCase(rejectAgent.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(rejectAgent.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(rejectAgent.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to reject guide';
      })
      .addCase(setAgentActiveStatus.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(setAgentActiveStatus.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        if (state.selectedAgent?.id === action.payload.userId) {
          state.selectedAgent.isActive = action.payload.isActive;
        }
      })
      .addCase(setAgentActiveStatus.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to update guide status';
      });
  },
});

export const { clearSelectedAgent } = agentSlice.actions;
export default agentSlice.reducer;

export const selectAdminGuides = (state: RootState) => state.agent.adminGuides;
export const selectUnverifiedGuides = (state: RootState) => state.agent.unverified;
export const selectSelectedAgent = (state: RootState) => state.agent.selectedAgent;
export const selectSelectedAgentApplications = (state: RootState) =>
  state.agent.selectedAgentApplications;
export const selectSelectedAgentPendingApplications = (state: RootState) =>
  state.agent.selectedAgentPendingApplications;
export const selectAdminGuideStatus = (state: RootState) => state.agent.adminStatus;
export const selectUnverifiedGuideStatus = (state: RootState) => state.agent.unverifiedStatus;
export const selectAdminGuideError = (state: RootState) => state.agent.adminError;
export const selectUnverifiedGuideError = (state: RootState) => state.agent.unverifiedError;
/** @deprecated use selectAdminGuideStatus */
export const selectAgentStatus = selectAdminGuideStatus;
export const selectAgentDetailStatus = (state: RootState) => state.agent.detailStatus;
export const selectActiveGuideCount = (state: RootState) =>
  state.agent.adminGuides.filter((g) => g.status === 'active').length;

export const selectGuideById = (state: RootState, id: string) =>
  state.agent.selectedAgent?.id === id
    ? state.agent.selectedAgent
    : state.agent.adminGuides.find((g) => g.id === id) ??
      state.agent.unverified.find((g) => g.id === id);
