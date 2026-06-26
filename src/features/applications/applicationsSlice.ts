import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mapApplications } from '@/api/mappers/applicationMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { Application } from '@/mocks/applications';
import { applicationsApi } from './applicationsApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface ApplicationsState {
  items: Application[];
  status: RequestStatus;
  mutationStatus: RequestStatus;
  error: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const fetchApplications = createAsyncThunk(
  'applications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const records = await applicationsApi.getAllAdminPending();
      return mapApplications(records);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const approveApplication = createAsyncThunk(
  'applications/approve',
  async (applicationId: number, { dispatch, rejectWithValue }) => {
    try {
      await applicationsApi.approveGuideApplication({
        applicationId,
        status: 'Approved',
      });
      await dispatch(fetchApplications());
      return applicationId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load applications';
      })
      .addCase(approveApplication.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(approveApplication.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(approveApplication.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to approve application';
      });
  },
});

export default applicationsSlice.reducer;

export const selectApplications = (state: RootState) => state.applications.items;
export const selectApplicationsStatus = (state: RootState) => state.applications.status;
export const selectApplicationsError = (state: RootState) => state.applications.error;
export const selectApplicationsMutationStatus = (state: RootState) =>
  state.applications.mutationStatus;
export const selectPendingApplicationCount = (state: RootState) => state.applications.items.length;
