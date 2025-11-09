import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(10).max(15),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  country: z.string().min(1),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(orderItemSchema).nonempty(),
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    paymentMethod: z.enum(['razorpay', 'cod']),
    couponCode: z.string().optional(),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    reason: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
    note: z.string().optional(),
  }),
});

