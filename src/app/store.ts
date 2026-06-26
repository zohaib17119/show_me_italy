import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '@/features/ui/uiSlice';
import authReducer from '@/features/auth/authSlice';
import notificationReducer from '@/features/notifications/notificationSlice';
import tourReducer from '@/features/tour/tourSlice';
import tourTypeReducer from '@/features/tourType/tourTypeSlice';
import languageReducer from '@/features/language/languageSlice';
import agentReducer from '@/features/agent/agentSlice';
import applicationsReducer from '@/features/applications/applicationsSlice';
import walletReducer from '@/features/wallet/walletSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    notifications: notificationReducer,
    tour: tourReducer,
    tourType: tourTypeReducer,
    language: languageReducer,
    agent: agentReducer,
    applications: applicationsReducer,
    wallet: walletReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
