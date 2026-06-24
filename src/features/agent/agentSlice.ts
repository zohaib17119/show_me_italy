import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mapAgentsToGuides } from '@/api/mappers/agentMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { Guide } from '@/mocks/guides';
import { agentApi } from './agentApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface AgentState {
  verified: Guide[];
  unverified: Guide[];
  status: RequestStatus;
  mutationStatus: RequestStatus;
  error: string | null;
}

const initialState: AgentState = {
  verified: [],
  unverified: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const fetchVerifiedAgents = createAsyncThunk(
  'agent/fetchVerified',
  async (_, { rejectWithValue }) => {
    try {
      const records = await agentApi.getVerifiedAgents();
      return mapAgentsToGuides(records, true);
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
      return mapAgentsToGuides(records, false);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchAllAgents = createAsyncThunk(
  'agent/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all([
        dispatch(fetchVerifiedAgents()),
        dispatch(fetchUnverifiedAgents()),
      ]);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const approveAgent = createAsyncThunk(
  'agent/approve',
  async (payload: { agentId: string }, { rejectWithValue, dispatch }) => {
    try {
      await agentApi.approveAgent({ agentId: payload.agentId, userId: payload.agentId });
      await dispatch(fetchAllAgents());
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerifiedAgents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchVerifiedAgents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.verified = action.payload;
      })
      .addCase(fetchVerifiedAgents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load guides';
      })
      .addCase(fetchUnverifiedAgents.fulfilled, (state, action) => {
        state.unverified = action.payload;
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
      });
  },
});

export default agentSlice.reducer;

export const selectVerifiedGuides = (state: RootState) => state.agent.verified;
export const selectUnverifiedGuides = (state: RootState) => state.agent.unverified;
export const selectAllGuides = (state: RootState) => [
  ...state.agent.verified,
  ...state.agent.unverified,
];
export const selectAgentStatus = (state: RootState) => state.agent.status;
export const selectActiveGuideCount = (state: RootState) => state.agent.verified.length;

export const selectGuideById = (state: RootState, id: string) =>
  selectAllGuides(state).find((g) => g.id === id);
