import axios, { type AxiosError } from 'axios';
import { AUTH_TOKEN_KEY } from '@/features/auth/authApi';
import { dispatchLogout } from './authBridge';
import {
  extractApiMessage,
  FALLBACK_ERROR_MESSAGE,
} from '@/api/utils/extractApiMessage';

const baseURL = import.meta.env.VITE_API_URL ?? 'https://demo.loade.app';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      dispatchLogout();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message =
      extractApiMessage(error.response?.data) ?? FALLBACK_ERROR_MESSAGE;
    return Promise.reject(new Error(message));
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return FALLBACK_ERROR_MESSAGE;
}
