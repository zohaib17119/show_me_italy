import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { extractApiMessage, FALLBACK_ERROR_MESSAGE } from '@/api/utils/extractApiMessage';
import {
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_TOKEN_KEY,
  authApi,
  extractToken,
  type SignInAdminRequest,
} from './authApi';
import type { RootState } from '@/app/store';

export const AUTH_USER_ID_KEY = 'authUserId';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

function userFromStored(email: string, name?: string, id?: string): User {
  const displayName = name?.trim() || email.split('@')[0] || 'Admin';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return {
    id: id?.trim() ?? '',
    name: displayName,
    email,
    role: 'Administrator',
    initials: initials || 'AD',
  };
}

const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

const initialState: AuthState = {
  user: storedToken
    ? userFromStored(
        localStorage.getItem('authEmail') ?? 'admin@showmeitaly.com',
        localStorage.getItem('authName') ?? undefined,
        localStorage.getItem(AUTH_USER_ID_KEY) ?? undefined,
      )
    : null,
  token: storedToken,
  isAuthenticated: Boolean(storedToken),
  status: 'idle',
  error: null,
};

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (payload: SignInAdminRequest, { rejectWithValue }) => {
    try {
      const { raw, body } = await authApi.signInAdmin(payload);
      const token = extractToken(body) ?? extractToken(raw);
      if (!token) {
        const apiMessage = extractApiMessage(raw) ?? extractApiMessage(body);
        return rejectWithValue(apiMessage ?? FALLBACK_ERROR_MESSAGE);
      }
      const email = body.email ?? payload.email;
      const name =
        body.fullName ??
        body.name ??
        (body as { userName?: string }).userName;
      const id = String(body.id ?? body.userId ?? '').trim();
      return {
        token,
        refreshToken: body.refreshToken ?? null,
        user: userFromStored(email, name, id),
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
      localStorage.removeItem('authEmail');
      localStorage.removeItem('authName');
      localStorage.removeItem(AUTH_USER_ID_KEY);
    },
    hydrateAuth(state) {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      state.token = token;
      state.isAuthenticated = Boolean(token);
      if (token) {
        state.user = userFromStored(
          localStorage.getItem('authEmail') ?? 'admin@showmeitaly.com',
          localStorage.getItem('authName') ?? undefined,
          localStorage.getItem(AUTH_USER_ID_KEY) ?? undefined,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
        localStorage.setItem('authEmail', action.payload.user.email);
        localStorage.setItem('authName', action.payload.user.name);
        if (action.payload.user.id) {
          localStorage.setItem(AUTH_USER_ID_KEY, action.payload.user.id);
        } else {
          localStorage.removeItem(AUTH_USER_ID_KEY);
        }
        if (action.payload.refreshToken) {
          localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, action.payload.refreshToken);
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? FALLBACK_ERROR_MESSAGE;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthUserId = (state: RootState) => state.auth.user?.id ?? '';
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
