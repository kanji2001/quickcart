import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { ApiResponse, Coupon, CouponWithEstimate } from '@/types/api';

export type CouponPayload = {
  code: string;
  description?: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minCartValue: number;
  maxDiscount?: number | null;
  startDate: string | Date;
  expiryDate: string | Date;
  isActive?: boolean;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  applicableCategories?: string[];
  applicableProducts?: string[];
};

export type ValidateCouponRequest = {
  code: string;
  cartTotal: number;
};

export const couponsApi = {
  list: (params?: { search?: string; status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; discountType?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).length > 0) {
          searchParams.set(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const url = query ? `${API_ROUTES.coupons.root}?${query}` : API_ROUTES.coupons.root;
    return http.get<ApiResponse<{ items: Coupon[] }>>(url);
  },
  create: (payload: CouponPayload) => http.post<ApiResponse<{ coupon: Coupon }>>(API_ROUTES.coupons.root, payload),
  update: (id: string, payload: CouponPayload) =>
    http.put<ApiResponse<{ coupon: Coupon }>>(API_ROUTES.coupons.byId(id), payload),
  remove: (id: string) => http.delete<ApiResponse<null>>(API_ROUTES.coupons.byId(id)),
  toggle: (id: string, isActive?: boolean) =>
    http.patch<ApiResponse<{ coupon: Coupon }>>(API_ROUTES.coupons.toggle(id), typeof isActive === 'boolean' ? { isActive } : {}),
  validate: (payload: ValidateCouponRequest) =>
    http.post<
      ApiResponse<{
        coupon: Coupon;
        discountAmount: number;
        payableAmount: number;
      }>
    >(API_ROUTES.coupons.validate, payload),
  available: (cartTotal: number) =>
    http.get<
      ApiResponse<{
        bestCouponCode: string | null;
        items: CouponWithEstimate[];
      }>
    >(`${API_ROUTES.coupons.available}?cartTotal=${encodeURIComponent(cartTotal)}`),
};


