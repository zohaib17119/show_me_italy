import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { TourSlot } from '@/api/types';
import {
  groupEventsByDate,
  mapTourSlotToCalendarEvent,
  type CalendarEvent,
} from '@/api/mappers/tourMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { tourApi } from './tourApi';
import type { RootState } from '@/app/store';

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface TourState {
  items: TourSlot[];
  status: RequestStatus;
  mutationStatus: RequestStatus;
  error: string | null;
}

const initialState: TourState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const fetchTours = createAsyncThunk('tour/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await tourApi.getAll();
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

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
  reducers: {},
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
      .addCase(updateTourSlot.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(updateTourSlot.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(deleteTourSlot.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      });
  },
});

export default tourSlice.reducer;

export const selectTourItems = (state: RootState) => state.tour.items;
export const selectTourStatus = (state: RootState) => state.tour.status;
export const selectTourError = (state: RootState) => state.tour.error;
export const selectTourMutationStatus = (state: RootState) => state.tour.mutationStatus;

export const selectCalendarEvents = (state: RootState): CalendarEvent[] => {
  const { items } = state.tour;
  const tourTypes = state.tourType.items;
  const languages = state.language.items;
  return items.map((slot) => mapTourSlotToCalendarEvent(slot, tourTypes, languages));
};

export const selectEventsByDate = (state: RootState) =>
  groupEventsByDate(selectCalendarEvents(state));

export const selectTodayTours = (state: RootState) => {
  const today = new Date().toISOString().slice(0, 10);
  return selectEventsByDate(state)[today] ?? [];
};

export const selectUnfilledCount = (state: RootState) =>
  selectCalendarEvents(state).filter((e) => e.unfilled).length;
