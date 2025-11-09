import { z } from 'zod';

export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const categorySlugParamSchema = z.object({
  params: z.object({
    idOrSlug: z.string().min(1),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    image: z
      .object({
        publicId: z.string().min(1),
        url: z.string().url(),
      })
      .optional(),
    parentCategory: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
  }),
});

export const updateCategorySchema = createCategorySchema.extend({
  params: z.object({
    id: z.string().min(1),
  }),
});

