import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
  }),
});

export const wishlistParamSchema = z.object({
  params: z.object({
    productId: z.string().min(1),
  }),
});

