import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AdminDashboardData } from '@/api/types';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { dashboardApi } from './dashboardApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface DashboardState {
  data: AdminDashboardData | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardApi.getAdminDashboard();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load dashboard';
      });
  },
});

export default dashboardSlice.reducer;

export const selectDashboardData = (state: RootState) => state.dashboard.data;
export const selectDashboardStatus = (state: RootState) => state.dashboard.status;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
