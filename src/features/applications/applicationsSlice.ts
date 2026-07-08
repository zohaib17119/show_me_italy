import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mapApplications } from '@/api/mappers/applicationMapper';
import {
  indexApplicationCalendarByDate,
  type ApplicationCalendarDaySummary,
} from '@/api/mappers/applicationCalendarMapper';
import {
  mapAvailableGuides,
  type AvailableGuideRow,
} from '@/api/mappers/availableGuideMapper';
import { mapGuideSlotApplicantsResponse } from '@/api/mappers/guideSlotApplicantsMapper';
import { mapGuideSlots, type GuideSlotRow } from '@/api/mappers/guideSlotMapper';
import type { SlotSummaryRow } from '@/api/mappers/slotSummaryMapper';
import type { SlotApplicantRow } from '@/api/mappers/slotApplicantMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { Application } from '@/mocks/applications';
import { applicationsApi, type ApplicationStatus } from './applicationsApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface ApplicationsState {
  items: Application[];
  status: RequestStatus;
  mutationStatus: RequestStatus;
  applicantMutationStatus: RequestStatus;
  manualAssignStatus: RequestStatus;
  error: string | null;
  guideSlots: GuideSlotRow[];
  guideSlotsStatus: RequestStatus;
  guideSlotsError: string | null;
  slotApplicants: SlotApplicantRow[];
  slotApplicantsStatus: RequestStatus;
  slotApplicantsError: string | null;
  slotApplicantsTourSlotId: number | null;
  slotSummary: SlotSummaryRow | null;
  availableGuides: AvailableGuideRow[];
  availableGuidesStatus: RequestStatus;
  availableGuidesError: string | null;
  applicationCalendarByDate: Record<string, ApplicationCalendarDaySummary>;
  applicationCalendarStatus: RequestStatus;
  applicationCalendarError: string | null;
}

const initialState: ApplicationsState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  applicantMutationStatus: 'idle',
  manualAssignStatus: 'idle',
  error: null,
  guideSlots: [],
  guideSlotsStatus: 'idle',
  guideSlotsError: null,
  slotApplicants: [],
  slotApplicantsStatus: 'idle',
  slotApplicantsError: null,
  slotApplicantsTourSlotId: null,
  slotSummary: null,
  availableGuides: [],
  availableGuidesStatus: 'idle',
  availableGuidesError: null,
  applicationCalendarByDate: {},
  applicationCalendarStatus: 'idle',
  applicationCalendarError: null,
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

export const fetchPendingApplicationCounts = createAsyncThunk(
  'applications/fetchPendingApplicationCounts',
  async (_, { rejectWithValue }) => {
    try {
      const records = await applicationsApi.getAllPendingCounts();
      return indexApplicationCalendarByDate(records);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchGuideSlots = createAsyncThunk(
  'applications/fetchGuideSlots',
  async (_, { rejectWithValue }) => {
    try {
      const records = await applicationsApi.getPendingGuideSlots();
      return mapGuideSlots(records);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchSlotApplicants = createAsyncThunk(
  'applications/fetchSlotApplicants',
  async (tourSlotId: number, { rejectWithValue }) => {
    try {
      const response = await applicationsApi.getGuideSlotApplicants(tourSlotId);
      const mapped = mapGuideSlotApplicantsResponse(response);
      return { tourSlotId, ...mapped };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const fetchAvailableGuides = createAsyncThunk(
  'applications/fetchAvailableGuides',
  async (_, { rejectWithValue }) => {
    try {
      const records = await applicationsApi.getAvailableGuides();
      return mapAvailableGuides(records);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export interface AssignGuideManuallyPayload {
  guideId: string;
  tourSlotId: number;
}

export const assignGuideManually = createAsyncThunk(
  'applications/assignGuideManually',
  async (payload: AssignGuideManuallyPayload, { dispatch, rejectWithValue }) => {
    try {
      const now = new Date().toISOString();
      await applicationsApi.assignGuideApplication({
        applicationId: 0,
        guideId: payload.guideId,
        tourSlotId: payload.tourSlotId,
        status: 'Approved',
        payRateSnapshot: 0,
        slotAssignmentId: 0,
        appliedAt: now,
        updatedAt: now,
      });
      await dispatch(fetchSlotApplicants(payload.tourSlotId));
      await dispatch(fetchAvailableGuides());
      return payload;
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

export interface UpdateSlotApplicantStatusPayload {
  applicationId: number;
  status: ApplicationStatus;
  tourSlotId: number;
}

export const updateSlotApplicantStatus = createAsyncThunk(
  'applications/updateSlotApplicantStatus',
  async (payload: UpdateSlotApplicantStatusPayload, { dispatch, rejectWithValue }) => {
    try {
      await applicationsApi.approveGuideApplication({
        applicationId: payload.applicationId,
        status: payload.status,
      });
      await dispatch(fetchSlotApplicants(payload.tourSlotId));
      return payload;
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
      .addCase(fetchGuideSlots.pending, (state) => {
        state.guideSlotsStatus = 'loading';
        state.guideSlotsError = null;
      })
      .addCase(fetchGuideSlots.fulfilled, (state, action) => {
        state.guideSlotsStatus = 'succeeded';
        state.guideSlots = action.payload;
      })
      .addCase(fetchGuideSlots.rejected, (state, action) => {
        state.guideSlotsStatus = 'failed';
        state.guideSlotsError = (action.payload as string) ?? 'Failed to load guide slots';
      })
      .addCase(fetchSlotApplicants.pending, (state) => {
        state.slotApplicantsStatus = 'loading';
        state.slotApplicantsError = null;
      })
      .addCase(fetchSlotApplicants.fulfilled, (state, action) => {
        state.slotApplicantsStatus = 'succeeded';
        state.slotApplicants = action.payload.applicants;
        state.slotApplicantsTourSlotId = action.payload.tourSlotId;
        state.slotSummary = action.payload.slotSummary;
      })
      .addCase(fetchSlotApplicants.rejected, (state, action) => {
        state.slotApplicantsStatus = 'failed';
        state.slotApplicantsError =
          (action.payload as string) ?? 'Failed to load slot applicants';
        state.slotSummary = null;
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
      })
      .addCase(updateSlotApplicantStatus.pending, (state) => {
        state.applicantMutationStatus = 'loading';
      })
      .addCase(updateSlotApplicantStatus.fulfilled, (state) => {
        state.applicantMutationStatus = 'succeeded';
      })
      .addCase(updateSlotApplicantStatus.rejected, (state, action) => {
        state.applicantMutationStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to update applicant status';
      })
      .addCase(fetchAvailableGuides.pending, (state) => {
        state.availableGuidesStatus = 'loading';
        state.availableGuidesError = null;
      })
      .addCase(fetchAvailableGuides.fulfilled, (state, action) => {
        state.availableGuidesStatus = 'succeeded';
        state.availableGuides = action.payload;
      })
      .addCase(fetchAvailableGuides.rejected, (state, action) => {
        state.availableGuidesStatus = 'failed';
        state.availableGuidesError =
          (action.payload as string) ?? 'Failed to load available guides';
      })
      .addCase(assignGuideManually.pending, (state) => {
        state.manualAssignStatus = 'loading';
      })
      .addCase(assignGuideManually.fulfilled, (state) => {
        state.manualAssignStatus = 'succeeded';
      })
      .addCase(assignGuideManually.rejected, (state, action) => {
        state.manualAssignStatus = 'failed';
        state.error = (action.payload as string) ?? 'Failed to assign guide';
      })
      .addCase(fetchPendingApplicationCounts.pending, (state) => {
        state.applicationCalendarStatus = 'loading';
        state.applicationCalendarError = null;
      })
      .addCase(fetchPendingApplicationCounts.fulfilled, (state, action) => {
        state.applicationCalendarStatus = 'succeeded';
        state.applicationCalendarByDate = action.payload;
      })
      .addCase(fetchPendingApplicationCounts.rejected, (state, action) => {
        state.applicationCalendarStatus = 'failed';
        state.applicationCalendarError =
          (action.payload as string) ?? 'Failed to load application calendar';
      });
  },
});

export default applicationsSlice.reducer;

export const selectApplications = (state: RootState) => state.applications.items;
export const selectApplicationsStatus = (state: RootState) => state.applications.status;
export const selectApplicationsError = (state: RootState) => state.applications.error;
export const selectApplicationsMutationStatus = (state: RootState) =>
  state.applications.mutationStatus;
export const selectApplicantMutationStatus = (state: RootState) =>
  state.applications.applicantMutationStatus;
export const selectManualAssignStatus = (state: RootState) =>
  state.applications.manualAssignStatus;
export const selectPendingApplicationCount = (state: RootState) => state.applications.items.length;

export const selectGuideSlots = (state: RootState) => state.applications.guideSlots;
export const selectGuideSlotsStatus = (state: RootState) => state.applications.guideSlotsStatus;
export const selectGuideSlotsError = (state: RootState) => state.applications.guideSlotsError;

export const selectSlotApplicants = (state: RootState) => state.applications.slotApplicants;
export const selectSlotApplicantsStatus = (state: RootState) =>
  state.applications.slotApplicantsStatus;
export const selectSlotApplicantsError = (state: RootState) =>
  state.applications.slotApplicantsError;
export const selectSlotSummary = (state: RootState) => state.applications.slotSummary;

export const selectAvailableGuides = (state: RootState) => state.applications.availableGuides;
export const selectAvailableGuidesStatus = (state: RootState) =>
  state.applications.availableGuidesStatus;
export const selectAvailableGuidesError = (state: RootState) =>
  state.applications.availableGuidesError;

export const selectApplicationCalendarByDate = (state: RootState) =>
  state.applications.applicationCalendarByDate;
export const selectApplicationCalendarStatus = (state: RootState) =>
  state.applications.applicationCalendarStatus;
export const selectApplicationCalendarError = (state: RootState) =>
  state.applications.applicationCalendarError;
