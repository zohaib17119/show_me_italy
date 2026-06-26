import { axiosInstance } from '@/api/axiosInstance';
import { unwrapData } from '@/api/types';

export interface SignInAdminRequest {
  email: string;
  password: string;
}

export interface SignInAdminResponse {
  id?: string;
  jwtToken?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  refreshTokenExpiration?: string;
  email?: string;
  fullName?: string;
  name?: string;
  role?: string;
  userId?: string;
  isAuthenticated?: boolean;
  [key: string]: unknown;
}

export const AUTH_REFRESH_TOKEN_KEY = 'refreshToken';

export function extractToken(payload: SignInAdminResponse): string | null {
  const nested = payload as { data?: SignInAdminResponse };
  const source = nested.data ?? payload;
  const token =
    source.jwtToken ??
    source.token ??
    source.accessToken ??
    (source as { access_token?: string }).access_token ??
    null;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

export const authApi = {
  signInAdmin: async (payload: SignInAdminRequest): Promise<SignInAdminResponse> => {
    const { data } = await axiosInstance.post('/v1/Agent/sign-in-admin', payload);
    return unwrapData<SignInAdminResponse>(data) ?? (data as SignInAdminResponse);
  },
};

export const AUTH_TOKEN_KEY = 'accessToken';
