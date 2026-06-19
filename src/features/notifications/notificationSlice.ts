import { createSlice } from '@reduxjs/toolkit';
import type { BadgeKey } from '@/types';

interface NotificationCounts {
  guides: number;
  approvals: number;
  applications: number;
  payouts: number;
  notifications: number;
}

interface NotificationState {
  counts: NotificationCounts;
}

const initialState: NotificationState = {
  counts: {
    guides: 48,
    approvals: 3,
    applications: 12,
    payouts: 7,
    notifications: 4,
  },
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
});

export function selectBadgeCount(
  counts: NotificationCounts,
  key: BadgeKey,
): number {
  return counts[key];
}

export default notificationSlice.reducer;
