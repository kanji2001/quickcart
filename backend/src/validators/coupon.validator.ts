import { z } from 'zod';

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    cartTotal: z.coerce.number().min(0),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    description: z.string().optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number().min(0),
    minPurchaseAmount: z.coerce.number().min(0).default(0),
    maxDiscountAmount: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().int().min(0).optional(),
    usageCount: z.coerce.number().int().min(0).optional(),
    userUsageLimit: z.coerce.number().int().min(0).optional(),
    validFrom: z.coerce.date(),
    validUntil: z.coerce.date(),
    isActive: z.coerce.boolean().optional(),
    applicableCategories: z.array(z.string()).default([]),
    applicableProducts: z.array(z.string()).default([]),
  }),
});

export const updateCouponSchema = createCouponSchema.extend({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const couponIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

