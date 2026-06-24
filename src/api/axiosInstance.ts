import axios, { type AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'https://demo.loade.app';

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// TODO: enable after login screens are built
// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
