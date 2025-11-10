import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { ApiResponse } from '@/types/api';

export type ContactRequest = {
  name: string;
  email: string;
  subject: string;
  message: string;
  orderId?: string;
};

export const supportApi = {
  contact: (payload: ContactRequest) => http.post<ApiResponse<null>>(API_ROUTES.support.contact, payload),
};


