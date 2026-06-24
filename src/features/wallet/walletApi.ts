import { axiosInstance } from '@/api/axiosInstance';
import type { WalletBalance, WalletTransaction } from '@/api/types';
import { unwrapData } from '@/api/types';

export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const { data } = await axiosInstance.post('/v1/Wallet/get-balance', {});
    return unwrapData<WalletBalance>(data) ?? {};
  },

  getTransactionHistory: async (): Promise<WalletTransaction[]> => {
    const { data } = await axiosInstance.post('/v1/Wallet/transaction-history', {});
    return unwrapData<WalletTransaction[]>(data) ?? [];
  },

  getPayoutStatus: async (): Promise<WalletTransaction[]> => {
    const { data } = await axiosInstance.post('/v1/Wallet/payout-status', {});
    const unwrapped = unwrapData<WalletTransaction[] | WalletTransaction>(data);
    if (Array.isArray(unwrapped)) return unwrapped;
    if (unwrapped) return [unwrapped];
    return [];
  },

  requestPayout: async (payload: Record<string, unknown> = {}): Promise<void> => {
    await axiosInstance.post('/v1/Wallet/request-payout', payload);
  },
};
