import { z } from 'zod';

export const RoleQuerySchema = z.object({
    page: z.coerce.number().optional().default(1),
    size: z.coerce.number().optional().default(10),
    ording: z.string().optional(),
    name: z.string().optional(),
    active: z.coerce.boolean().optional(),
});

export const RoleSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    active: z.boolean(),
});

export const RoleCreateSchema = z.object({
    name: z.string().max(128),
    description: z.string(),
    active: z.boolean().optional().default(true),
});

export const RoleUpdateSchema = z.object({
    name: z.string().max(128).optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
});
