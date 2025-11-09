import { z } from 'zod';

const imageSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    category: z.string().min(1),
    subCategory: z.string().optional(),
    brand: z.string().optional(),
    sku: z.string().min(1),
    stock: z.coerce.number().int().min(0).default(0),
    images: z.array(imageSchema).default([]),
    thumbnail: imageSchema.partial().optional(),
    features: z.array(z.string()).default([]),
    specifications: z.record(z.any()).default({}),
    isFeatured: z.coerce.boolean().optional(),
    isNew: z.coerce.boolean().optional(),
    isTrending: z.coerce.boolean().optional(),
    isActive: z.coerce.boolean().optional(),
    tags: z.array(z.string()).default([]),
    weight: z.coerce.number().optional(),
    dimensions: z
      .object({
        length: z.coerce.number(),
        width: z.coerce.number(),
        height: z.coerce.number(),
      })
      .partial()
      .optional(),
  }),
});

export const updateProductSchema = createProductSchema.extend({
  params: z.object({
    id: z.string().min(1),
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

