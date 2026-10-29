import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { BulkTourSlotCreatePayload, TourSlot, TourSlotFilter } from '@/api/types';
import {
 indexSummariesByDate,
 type CalendarDaySummary,
} from '@/api/mappers/calendarSummaryMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { tourApi } from './tourApi';
import type { RootState } from '@/app/store';

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface TourState {
 items: TourSlot[];
 selectedTour: TourSlot | null;
 calendarSummaries: Record<string, CalendarDaySummary>;
 status: RequestStatus;
 calendarStatus: RequestStatus;
 detailStatus: RequestStatus;
 mutationStatus: RequestStatus;
 error: string | null;
 calendarError: string | null;
 detailError: string | null;
}

const initialState: TourState = {
 items: [],
 selectedTour: null,
 calendarSummaries: {},
 status: 'idle',
 calendarStatus: 'idle',
 detailStatus: 'idle',
 mutationStatus: 'idle',
 error: null,
 calendarError: null,
 detailError: null,
};

export const fetchTours = createAsyncThunk(
 'tour/fetchAll',
 async (filter: TourSlotFilter | undefined, { rejectWithValue }) => {
 try {
 return await tourApi.getAllAdmin(filter ?? {});
 } catch (error) {
 return rejectWithValue(getApiErrorMessage(error));
 }
 },
);

export const fetchCalendarSummaries = createAsyncThunk(
 'tour/fetchCalendarSummaries',
 async (filter: TourSlotFilter | undefined, { rejectWithValue }) => {
 try {
 const records = await tourApi.getCalendarSummaries(filter ?? {});
 return indexSummariesByDate(records);
 } catch (error) {
 return rejectWithValue(getApiErrorMessage(error));
 }
 },
);

export const fetchTourById = createAsyncThunk(
 'tour/fetchById',
 async (id: number, { rejectWithValue }) => {
 try {
 const tour = await tourApi.getById(id);
 if (!tour) {
 return rejectWithValue('Tour not found');
 }
 return tour;
 } catch (error) {
 return rejectWithValue(getApiErrorMessage(error));
 }
 },
);

export const createTourSlot = createAsyncThunk(
 'tour/create',
 async (payload: TourSlot, { rejectWithValue, dispatch }) => {
 try {
 const created = await tourApi.create(payload);
 await dispatch(fetchTours());
 return created;
 } catch (error) {
 return rejectWithValue(getApiErrorMessage(error));
 }
 },
);

export const createBulkTourSlots = createAsyncThunk(
 'tour/bulkCreate',
 async (payload: BulkTourSlotCreatePayload, { rejectWithValue, dispatch }) => {
 try {
 const created = await tourApi.bulkCreate(payload);
 await dispatch(fetchTours());
 return created;
 } catch (error) {
 return rejectWithValue(getApiErrorMessage(error));
 }
 },
);

export const updateTourSlot = createAsyncThunk(
 'tour/update',
 async (payload: TourSlot, { rejectWithValue, dispatch }) => {
 try {
 const updated = await tourApi.update(payload);
 await dispatch(fetchTours());
 return updated;
 } catch (error) {
 return rejectWithValue(getApiErrorMessage(error));
 }
 },
);

export const deleteTourSlot = createAsyncThunk(
 'tour/delete',
 async (id: number, { rejectWithValue, dispatch }) => {
 try {
 await tourApi.delete(id);
 await dispatch(fetchTours());
 return id;
 } catch (error) {
 return rejectWithValue(getApiErrorMessage(error));
 }
 },
);

const tourSlice = createSlice({
 name: 'tour',
 initialState,
 reducers: {
 clearSelectedTour(state) {
 state.selectedTour = null;
 state.detailStatus = 'idle';
 state.detailError = null;
 },
 },
 extraReducers: (builder) => {
 builder
 .addCase(fetchTours.pending, (state) => {
 state.status = 'loading';
 state.error = null;
 })
 .addCase(fetchTours.fulfilled, (state, action) => {
 state.status = 'succeeded';
 state.items = action.payload;
 })
 .addCase(fetchTours.rejected, (state, action) => {
 state.status = 'failed';
 state.error = (action.payload as string) ?? 'Failed to load tours';
 })
 .addCase(fetchCalendarSummaries.pending, (state) => {
 state.calendarStatus = 'loading';
 state.calendarError = null;
 })
 .addCase(fetchCalendarSummaries.fulfilled, (state, action) => {
 state.calendarStatus = 'succeeded';
 state.calendarSummaries = action.payload;
 })
 .addCase(fetchCalendarSummaries.rejected, (state, action) => {
 state.calendarStatus = 'failed';
 state.calendarError = (action.payload as string) ?? 'Failed to load calendar';
 })
 .addCase(fetchTourById.pending, (state) => {
 state.detailStatus = 'loading';
 state.detailError = null;
 })
 .addCase(fetchTourById.fulfilled, (state, action) => {
 state.detailStatus = 'succeeded';
 state.selectedTour = action.payload;
 })
 .addCase(fetchTourById.rejected, (state, action) => {
 state.detailStatus = 'failed';
 state.selectedTour = null;
 state.detailError = (action.payload as string) ?? 'Failed to load tour';
 })
 .addCase(createTourSlot.pending, (state) => {
 state.mutationStatus = 'loading';
 })
 .addCase(createTourSlot.fulfilled, (state) => {
 state.mutationStatus = 'succeeded';
 })
 .addCase(createTourSlot.rejected, (state, action) => {
 state.mutationStatus = 'failed';
 state.error = (action.payload as string) ?? 'Failed to create tour';
 })
 .addCase(createBulkTourSlots.pending, (state) => {
 state.mutationStatus = 'loading';
 })
 .addCase(createBulkTourSlots.fulfilled, (state) => {
 state.mutationStatus = 'succeeded';
 })
 .addCase(createBulkTourSlots.rejected, (state, action) => {
 state.mutationStatus = 'failed';
 state.error = (action.payload as string) ?? 'Failed to create tour slots';
 })
 .addCase(updateTourSlot.pending, (state) => {
 state.mutationStatus = 'loading';
 })
 .addCase(updateTourSlot.fulfilled, (state) => {
 state.mutationStatus = 'succeeded';
 })
 .addCase(updateTourSlot.rejected, (state, action) => {
 state.mutationStatus = 'failed';
 state.error = (action.payload as string) ?? 'Failed to update tour';
 })
 .addCase(deleteTourSlot.pending, (state) => {
 state.mutationStatus = 'loading';
 })
 .addCase(deleteTourSlot.fulfilled, (state, action) => {
 state.mutationStatus = 'succeeded';
 state.items = state.items.filter((t) => t.tourSlotId !== action.payload);
 if (state.selectedTour?.tourSlotId === action.payload) {
 state.selectedTour = null;
 }
 })
 .addCase(deleteTourSlot.rejected, (state, action) => {
 state.mutationStatus = 'failed';
 state.error = (action.payload as string) ?? 'Failed to delete tour';
 });
 },
});

export const { clearSelectedTour } = tourSlice.actions;
export default tourSlice.reducer;

export const selectTourItems = (state: RootState) => state.tour.items;
export const selectSelectedTour = (state: RootState) => state.tour.selectedTour;
export const selectTourStatus = (state: RootState) => state.tour.status;
export const selectTourDetailStatus = (state: RootState) => state.tour.detailStatus;
export const selectTourError = (state: RootState) => state.tour.error;
export const selectTourDetailError = (state: RootState) => state.tour.detailError;
export const selectTourMutationStatus = (state: RootState) => state.tour.mutationStatus;
export const selectCalendarSummariesByDate = (state: RootState) => state.tour.calendarSummaries;
export const selectCalendarStatus = (state: RootState) => state.tour.calendarStatus;
export const selectCalendarError = (state: RootState) => state.tour.calendarError;
