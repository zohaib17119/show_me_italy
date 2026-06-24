import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  computePayoutSummary,
  mapWalletTransactions,
} from '@/api/mappers/walletMapper';
import { getApiErrorMessage } from '@/api/axiosInstance';
import type { PayoutRequest } from '@/mocks/payouts';
import { walletApi } from './walletApi';
import type { RootState } from '@/app/store';
import type { RequestStatus } from '@/features/tour/tourSlice';

interface WalletState {
  transactions: PayoutRequest[];
  summary: ReturnType<typeof computePayoutSummary>;
  balance: number;
  status: RequestStatus;
  error: string | null;
}

const initialState: WalletState = {
  transactions: [],
  summary: { totalPending: 0, paidThisMonth: 0, queueCount: 0, revisionNeeded: 0 },
  balance: 0,
  status: 'idle',
  error: null,
};

export const fetchWalletData = createAsyncThunk(
  'wallet/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [history, payoutStatus, balanceData] = await Promise.all([
        walletApi.getTransactionHistory(),
        walletApi.getPayoutStatus(),
        walletApi.getBalance(),
      ]);
      const combined = history.length > 0 ? history : payoutStatus;
      const transactions = mapWalletTransactions(combined);
      return {
        transactions,
        summary: computePayoutSummary(transactions),
        balance: Number(balanceData.balance ?? balanceData.pending ?? 0),
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.transactions = action.payload.transactions;
        state.summary = action.payload.summary;
        state.balance = action.payload.balance;
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load wallet data';
      });
  },
});

export default walletSlice.reducer;

export const selectWalletTransactions = (state: RootState) => state.wallet.transactions;
export const selectWalletSummary = (state: RootState) => state.wallet.summary;
export const selectWalletBalance = (state: RootState) => state.wallet.balance;
export const selectWalletStatus = (state: RootState) => state.wallet.status;

export const selectPayoutById = (state: RootState, id: string) =>
  state.wallet.transactions.find((t) => t.id === id);
