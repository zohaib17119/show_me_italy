import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { TourType } from '@/api/types';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { tourTypeApi } from './tourTypeApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface TourTypeState {
  items: TourType[];
  status: RequestStatus;
  mutationStatus: RequestStatus;
  error: string | null;
}

const initialState: TourTypeState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const fetchTourTypes = createAsyncThunk(
  'tourType/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await tourTypeApi.getAll();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const createTourType = createAsyncThunk(
  'tourType/create',
  async (payload: TourType, { rejectWithValue, dispatch }) => {
    try {
      const created = await tourTypeApi.create(payload);
      await dispatch(fetchTourTypes());
      return created;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const updateTourType = createAsyncThunk(
  'tourType/update',
  async (payload: TourType, { rejectWithValue, dispatch }) => {
    try {
      const updated = await tourTypeApi.update(payload);
      await dispatch(fetchTourTypes());
      return updated;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteTourType = createAsyncThunk(
  'tourType/delete',
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await tourTypeApi.delete(id);
      await dispatch(fetchTourTypes());
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const tourTypeSlice = createSlice({
  name: 'tourType',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTourTypes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTourTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTourTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load tour types';
      })
      .addCase(createTourType.pending, (state) => {
        state.mutationStatus = 'loading';
      })
      .addCase(createTourType.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateTourType.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(deleteTourType.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      });
  },
});

export default tourTypeSlice.reducer;

export const selectTourTypes = (state: RootState) => state.tourType.items;
export const selectTourTypeStatus = (state: RootState) => state.tourType.status;
