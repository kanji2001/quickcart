import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    phone: z.string().regex(/^\d{10}$/),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(8),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Password must include an uppercase letter')
      .regex(/[a-z]/, 'Password must include a lowercase letter')
      .regex(/\d/, 'Password must include a number')
      .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    fullName: z.string().min(1),
    phone: z.string().min(10).max(15),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(4),
    country: z.string().min(1),
    isDefault: z.boolean().optional(),
    addressType: z.enum(['home', 'office', 'other']).optional(),
  }),
});

export const addressParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

