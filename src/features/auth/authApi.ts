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

export interface SignInAdminResult {
  raw: unknown;
  body: SignInAdminResponse;
}

export const AUTH_REFRESH_TOKEN_KEY = 'refreshToken';

export function extractToken(payload: SignInAdminResponse | unknown): string | null {
  const nested = payload as { data?: SignInAdminResponse };
  const source = nested.data ?? (payload as SignInAdminResponse);
  const token =
    source.jwtToken ??
    source.token ??
    source.accessToken ??
    (source as { access_token?: string }).access_token ??
    null;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

export const authApi = {
  signInAdmin: async (payload: SignInAdminRequest): Promise<SignInAdminResult> => {
    const { data } = await axiosInstance.post('/v1/Agent/sign-in-admin', payload);
    const body = unwrapData<SignInAdminResponse>(data) ?? (data as SignInAdminResponse);
    return { raw: data, body };
  },
};

export const AUTH_TOKEN_KEY = 'accessToken';
