import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@/types';

// Auth phase (end): wire login via POST /v1/CompanyUser/verify-credentials
// and uncomment axios auth interceptor + ProtectedRoute redirect.

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: {
    name: 'Super Admin',
    email: 'admin@showmeitaly.com',
    role: 'Administrator',
    initials: 'SA',
  },
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
});

export default authSlice.reducer;
