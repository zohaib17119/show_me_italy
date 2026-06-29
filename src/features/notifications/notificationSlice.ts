import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { NotificationsDto } from '@/api/types';
import type { CreateNotificationPayload } from '@/api/types';
import {
  mapAnnouncementsToInboxRows,
  type AnnouncementInboxRow,
} from '@/api/mappers/notificationMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import { notificationsApi } from './notificationsApi';
import type { BadgeKey } from '@/types';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

export type { AnnouncementInboxRow as InboxItem };

interface NotificationCounts {
  guides: number;
  approvals: number;
  applications: number;
  payouts: number;
  notifications: number;
}

interface NotificationState {
  counts: NotificationCounts;
  inbox: AnnouncementInboxRow[];
  inboxStatus: RequestStatus;
  inboxError: string | null;
}

const initialState: NotificationState = {
  counts: {
    guides: 0,
    approvals: 0,
    applications: 0,
    payouts: 0,
    notifications: 0,
  },
  inbox: [],
  inboxStatus: 'idle',
  inboxError: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const items = await notificationsApi.getAll();
      return mapAnnouncementsToInboxRows(items);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const createAnnouncement = createAsyncThunk(
  'notifications/createAnnouncement',
  async (payload: CreateNotificationPayload, { rejectWithValue, dispatch }) => {
    try {
      await notificationsApi.create(payload);
      await dispatch(fetchNotifications());
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const sendNotification = createAsyncThunk(
  'notifications/send',
  async (payload: NotificationsDto, { rejectWithValue, dispatch }) => {
    try {
      await notificationsApi.insert(payload);
      await dispatch(fetchNotifications());
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: number, { rejectWithValue, dispatch }) => {
    try {
      await notificationsApi.readById(notificationId);
      await dispatch(fetchNotifications());
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id: number, { rejectWithValue, dispatch }) => {
    try {
      await notificationsApi.delete(id);
      await dispatch(fetchNotifications());
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setBadgeCounts(state, action: { payload: Partial<NotificationCounts> }) {
      state.counts = { ...state.counts, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.inboxStatus = 'loading';
        state.inboxError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.inboxStatus = 'succeeded';
        state.inbox = action.payload;
        state.counts.notifications = action.payload.filter((n) => n.unread).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.inboxStatus = 'failed';
        state.inboxError = (action.payload as string) ?? 'Failed to load notifications';
      });
  },
});

export const { setBadgeCounts } = notificationSlice.actions;

export function selectBadgeCount(counts: NotificationCounts, key: BadgeKey): number {
  return counts[key];
}

export const selectInboxItems = (state: RootState) => state.notifications.inbox;
export const selectInboxStatus = (state: RootState) => state.notifications.inboxStatus;
export const selectInboxError = (state: RootState) => state.notifications.inboxError;
export const selectNotificationCounts = (state: RootState) => state.notifications.counts;

export default notificationSlice.reducer;
