import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import { ApiResponse } from '@/types/api';
import type { AuthUser } from '@/stores/auth-store';

type AuthPayload = {
  user: AuthUser;
  accessToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export const authApi = {
  register: (payload: RegisterRequest) => http.post<ApiResponse<AuthPayload>>(API_ROUTES.auth.register, payload),
  login: (payload: LoginRequest) => http.post<ApiResponse<AuthPayload>>(API_ROUTES.auth.login, payload),
  logout: () => http.post<ApiResponse<null>>(API_ROUTES.auth.logout, null),
  me: () => http.get<ApiResponse<{ user: AuthUser }>>(API_ROUTES.auth.me),
  forgotPassword: (email: string, redirectUrl?: string) =>
    http.post<ApiResponse<{ resetToken?: string; resetUrl?: string }>>(API_ROUTES.auth.forgotPassword, {
      email,
      redirectUrl,
    }),
  resetPassword: (token: string, password: string) =>
    http.post<ApiResponse<null>>(API_ROUTES.auth.resetPassword(token), { password }),
  verifyEmail: (token: string) => http.get<ApiResponse<null>>(API_ROUTES.auth.verifyEmail(token)),
};

