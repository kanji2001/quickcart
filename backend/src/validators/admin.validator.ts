import { z } from 'zod';

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateUserRoleSchema = userIdParamSchema.extend({
  body: z.object({
    role: z.enum(['user', 'admin']),
  }),
});

export const toggleUserBlockSchema = userIdParamSchema.extend({
  body: z.object({
    isBlocked: z.boolean(),
  }),
});

