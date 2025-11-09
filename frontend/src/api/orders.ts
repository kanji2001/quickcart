import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type OrderListFilters = {
  page?: number;
  limit?: number;
  status?: string;
};

export const buildQuery = (filters: OrderListFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const ordersApi = {
  list: (filters?: OrderListFilters) =>
    http.get<
      ApiResponse<{
        items: unknown[];
        pagination: PaginatedResponse<unknown>['pagination'];
      }>
    >(`${API_ROUTES.orders.root}${buildQuery(filters)}`),
  detail: (orderId: string) => http.get<ApiResponse<{ order: unknown }>>(API_ROUTES.orders.byId(orderId)),
  cancel: (orderId: string, reason?: string) =>
    http.put<ApiResponse<{ order: unknown }>>(API_ROUTES.orders.cancel(orderId), { reason }),
};

