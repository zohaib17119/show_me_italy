import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '@/features/ui/uiSlice';
import authReducer from '@/features/auth/authSlice';
import notificationReducer from '@/features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
