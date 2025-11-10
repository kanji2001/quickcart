import { z } from 'zod';

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    cartTotal: z.coerce.number().min(0),
  }),
});

const discountTypeSchema = z
  .enum(['percent', 'flat'])
  .or(z.enum(['percentage', 'fixed']).transform((value) => (value === 'percentage' ? 'percent' : 'flat')));

const buildCouponBodySchema = () =>
  z
    .object({
      code: z.string().min(1),
      description: z.string().optional(),
      discountType: discountTypeSchema,
      discountValue: z.coerce.number().min(0),
      minCartValue: z.coerce.number().min(0).default(0),
      maxDiscount: z.coerce.number().min(0).optional(),
      usageLimit: z.coerce.number().int().min(0).optional(),
      usageCount: z.coerce.number().int().min(0).optional(),
      perUserLimit: z.coerce.number().int().min(0).optional(),
      startDate: z.coerce.date(),
      expiryDate: z.coerce.date(),
      isActive: z.coerce.boolean().optional(),
      applicableCategories: z.array(z.string()).default([]),
      applicableProducts: z.array(z.string()).default([]),
    })
    .superRefine((data, ctx) => {
      if (data.startDate > data.expiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Expiry date must be after start date',
          path: ['expiryDate'],
        });
      }
    });

export const createCouponSchema = z.object({
  body: buildCouponBodySchema(),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: buildCouponBodySchema(),
});

export const couponIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const toggleCouponSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z
    .object({
      isActive: z.coerce.boolean().optional(),
    })
    .optional(),
});

export const availableCouponsSchema = z.object({
  query: z.object({
    cartTotal: z.coerce.number().min(0).optional(),
  }),
});

