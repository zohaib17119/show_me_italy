import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { getApiErrorMessage } from '@/api/axiosInstance';
import {
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_TOKEN_KEY,
  authApi,
  extractToken,
  type SignInAdminRequest,
} from './authApi';
import type { RootState } from '@/app/store';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

function userFromEmail(email: string, name?: string): User {
  const displayName = name?.trim() || email.split('@')[0] || 'Admin';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return {
    name: displayName,
    email,
    role: 'Administrator',
    initials: initials || 'AD',
  };
}

const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

const initialState: AuthState = {
  user: storedToken
    ? userFromEmail(
        localStorage.getItem('authEmail') ?? 'admin@showmeitaly.com',
        localStorage.getItem('authName') ?? undefined,
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
      const response = await authApi.signInAdmin(payload);
      const token = extractToken(response);
      if (!token) {
        return rejectWithValue('Login succeeded but no token was returned.');
      }
      const email = response.email ?? payload.email;
      const name =
        response.fullName ??
        response.name ??
        (response as { userName?: string }).userName;
      return {
        token,
        refreshToken: response.refreshToken ?? null,
        user: userFromEmail(email, name),
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
    },
    hydrateAuth(state) {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      state.token = token;
      state.isAuthenticated = Boolean(token);
      if (token) {
        state.user = userFromEmail(
          localStorage.getItem('authEmail') ?? 'admin@showmeitaly.com',
          localStorage.getItem('authName') ?? undefined,
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
        if (action.payload.refreshToken) {
          localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, action.payload.refreshToken);
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Login failed';
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
