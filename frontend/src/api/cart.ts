import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { ApiResponse } from '@/types/api';
import type { Cart } from '@/types/cart';

export type AddCartItemRequest = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  itemId: string;
  quantity: number;
};

export const cartApi = {
  get: () => http.get<ApiResponse<{ cart: Cart }>>(API_ROUTES.cart.root),
  addItem: (payload: AddCartItemRequest) => http.post<ApiResponse<{ cart: Cart }>>(API_ROUTES.cart.items, payload),
  updateItem: ({ itemId, quantity }: UpdateCartItemRequest) =>
    http.put<ApiResponse<{ cart: Cart }>>(API_ROUTES.cart.item(itemId), { quantity }),
  removeItem: (itemId: string) => http.delete<ApiResponse<{ cart: Cart }>>(API_ROUTES.cart.item(itemId)),
  clear: () => http.delete<ApiResponse<{ cart: Cart }>>(API_ROUTES.cart.clear),
};

