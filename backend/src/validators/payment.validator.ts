import { z } from 'zod';

export const createPaymentOrderSchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive(),
    currency: z.string().optional(),
    receipt: z.string().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
    orderId: z.string().min(1),
  }),
});

export const refundParamSchema = z.object({
  params: z.object({
    orderId: z.string().min(1),
  }),
});

