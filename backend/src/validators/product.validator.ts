import { z } from 'zod';

const imageSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
});

const stringOrStringArray = z.union([z.array(z.string()), z.string()]);

const productBodySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be positive'),
  discountPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((value, ctx) => {
      if (value === undefined || value === '') {
        return undefined;
      }
      const numericValue = Number(value);
      if (Number.isNaN(numericValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Discount price must be a valid number',
        });
        return z.NEVER;
      }
      return numericValue;
    })
    .refine(
      (value) => value === undefined || (typeof value === 'number' && value >= 0),
      'Discount price must be positive',
    ),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  images: z.array(imageSchema).default([]),
  thumbnail: imageSchema.partial().optional(),
  features: stringOrStringArray.optional(),
  specifications: z.record(z.string(), z.any()).default({}),
  isFeatured: z.coerce.boolean().optional(),
  isNew: z.coerce.boolean().optional(),
  isTrending: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  tags: stringOrStringArray.optional(),
  weight: z.coerce.number().optional(),
  dimensions: z
    .object({
      length: z.coerce.number(),
      width: z.coerce.number(),
      height: z.coerce.number(),
    })
    .partial()
    .optional(),
});

export const createProductSchema = z.object({
  body: productBodySchema,
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: productBodySchema
    .partial()
    .superRefine((value, ctx) => {
      if (Object.keys(value).length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one field must be provided',
        });
      }
    }),
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const productSlugParamSchema = z.object({
  params: z.object({
    idOrSlug: z.string().min(1),
  }),
});

export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(10),
    images: z.array(imageSchema.partial()).optional(),
  }),
});

