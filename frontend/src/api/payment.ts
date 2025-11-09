import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { ApiResponse, Order } from '@/types/api';

export type CreatePaymentOrderPayload = {
  amount: number;
  currency?: string;
  receipt?: string;
};

export type CreatePaymentOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
};

export type VerifyPaymentPayload = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  orderId: string;
};

export const paymentApi = {
  createOrder: (payload: CreatePaymentOrderPayload) =>
    http.post<ApiResponse<CreatePaymentOrderResponse>>(API_ROUTES.payment.createOrder, payload),
  verify: (payload: VerifyPaymentPayload) => http.post<ApiResponse<{ order: Order }>>(API_ROUTES.payment.verify, payload),
};


