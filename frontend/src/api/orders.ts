import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { AddressInput, ApiResponse, Order, PaginatedResponse } from '@/types/api';

export type OrderListFilters = {
  page?: number;
  limit?: number;
  status?: string;
};

export type CreateOrderItemPayload = {
  productId: string;
  quantity: number;
};

export type CreateOrderPayload = {
  items: CreateOrderItemPayload[];
  shippingAddress: AddressInput;
  billingAddress: AddressInput;
  paymentMethod: 'razorpay' | 'cod';
  couponCode?: string;
  saveAddress?: boolean;
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
  create: (payload: CreateOrderPayload) =>
    http.post<ApiResponse<{ order: Order }>>(API_ROUTES.orders.root, payload),
  list: (filters?: OrderListFilters) =>
    http.get<
      ApiResponse<{
        items: Order[];
        pagination: PaginatedResponse<Order>['pagination'];
      }>
    >(`${API_ROUTES.orders.root}${buildQuery(filters)}`),
  detail: (orderId: string) => http.get<ApiResponse<{ order: Order }>>(API_ROUTES.orders.byId(orderId)),
  cancel: (orderId: string, reason?: string) =>
    http.put<ApiResponse<{ order: Order }>>(API_ROUTES.orders.cancel(orderId), { reason }),
};

