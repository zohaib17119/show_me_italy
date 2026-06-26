import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit';
import type { Language } from '@/api/types';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { languageApi } from './languageApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface LanguageState {
  items: Language[];
  status: RequestStatus;
  mutationStatus: RequestStatus;
  error: string | null;
}

const initialState: LanguageState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const fetchLanguages = createAsyncThunk(
  'language/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await languageApi.getAll();
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const createLanguage = createAsyncThunk(
  'language/create',
  async (payload: Language, { rejectWithValue, dispatch }) => {
    try {
      const created = await languageApi.create(payload);
      await dispatch(fetchLanguages());
      return created;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const updateLanguage = createAsyncThunk(
  'language/update',
  async (payload: Language, { rejectWithValue, dispatch }) => {
    try {
      const updated = await languageApi.update(payload);
      await dispatch(fetchLanguages());
      return updated;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteLanguage = createAsyncThunk(
  'language/delete',
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await languageApi.delete(id);
      await dispatch(fetchLanguages());
      return id;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLanguages.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load languages';
      })
      .addCase(createLanguage.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateLanguage.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(deleteLanguage.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      });
  },
});

export default languageSlice.reducer;

export const selectLanguages = (state: RootState) => state.language.items;

export const selectActiveLanguages = createSelector([selectLanguages], (items) =>
  items.filter((l) => l.isActive !== false),
);

export const selectLanguageStatus = (state: RootState) => state.language.status;
